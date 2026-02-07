import { schedules, logger } from "@trigger.dev/sdk/v3";
import { sendEmail } from "./shared/email";

interface ContentTopic {
  id: string;
  title: string;
  slug: string;
  status: string;
  priority: string;
  target_date: string | null;
  tags: string[];
  notes?: string;
}

interface ContentPlan {
  topics: ContentTopic[];
  ideas_backlog: Array<{ id: string; title: string; priority: string; notes?: string }>;
}

export const calendarReminders = schedules.task({
  id: "calendar-reminders",
  // Mon/Thu 7am CST = 13:00 UTC
  cron: "0 13 * * 1,4",
  run: async () => {
    if (!process.env.TRIGGER_SECRET_KEY) {
      logger.info("Trigger.dev not configured, skipping");
      return { skipped: true };
    }

    // Read content plan from payload or skip in production
    let plan: ContentPlan;
    try {
      const fs = await import("fs");
      const path = await import("path");
      const planPath = path.join(process.cwd(), ".content/calendar/content-plan.json");
      plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
    } catch {
      logger.warn("Could not read content plan - only available in dev mode");
      return { skipped: true, reason: "filesystem not available" };
    }

    const today = new Date();
    const reminders: string[] = [];

    // Check overdue posts
    const overdue = plan.topics.filter((t) => {
      if (!t.target_date || t.status === "published") return false;
      return new Date(t.target_date) < today;
    });

    if (overdue.length > 0) {
      reminders.push(
        `<h3>Overdue Posts (${overdue.length})</h3><ul>${overdue.map((t) => `<li><strong>${t.title}</strong> - Target: ${t.target_date} (${t.status})</li>`).join("")}</ul>`
      );
    }

    // Check upcoming deadlines (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming = plan.topics.filter((t) => {
      if (!t.target_date || t.status === "published") return false;
      const target = new Date(t.target_date);
      return target >= today && target <= nextWeek;
    });

    if (upcoming.length > 0) {
      reminders.push(
        `<h3>Due This Week (${upcoming.length})</h3><ul>${upcoming.map((t) => `<li><strong>${t.title}</strong> - Target: ${t.target_date} (${t.status})</li>`).join("")}</ul>`
      );
    }

    // High-priority ideas needing attention
    const highPriorityIdeas = plan.ideas_backlog.filter((i) => i.priority === "high");
    if (highPriorityIdeas.length > 0) {
      reminders.push(
        `<h3>High-Priority Ideas (${highPriorityIdeas.length})</h3><ul>${highPriorityIdeas.map((i) => `<li><strong>${i.title}</strong>${i.notes ? ` - ${i.notes}` : ""}</li>`).join("")}</ul>`
      );
    }

    if (reminders.length === 0) {
      logger.info("No reminders to send");
      return { sent: false, reason: "nothing to report" };
    }

    await sendEmail({
      subject: `Content Calendar Reminder - ${today.toISOString().split("T")[0]}`,
      html: `<h2>Content Calendar Reminder</h2>${reminders.join("")}<hr><p><em>From DAK Blog Automation</em></p>`,
    });

    return { sent: true, reminderCount: reminders.length };
  },
});
