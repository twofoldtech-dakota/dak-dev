import { schedules, logger } from "@trigger.dev/sdk/v3";
import { sendEmail } from "./shared/email";

/**
 * Weekly analytics digest
 * Fetches Vercel Web Analytics API and compiles top pages + trends.
 * Friday 9am CST = 15:00 UTC
 */
export const analyticsDigest = schedules.task({
  id: "analytics-digest",
  cron: "0 15 * * 5",
  run: async () => {
    const token = process.env.VERCEL_API_TOKEN;
    if (!token) {
      logger.info("Analytics digest skipped: VERCEL_API_TOKEN not configured");
      return { skipped: true, reason: "VERCEL_API_TOKEN not set" };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dak-dev.vercel.app";
    // Extract domain for Vercel Analytics API
    const domain = new URL(siteUrl).hostname;

    // Fetch this week's analytics
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const fetchAnalytics = async (from: Date, to: Date) => {
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        limit: "10",
      });

      try {
        const res = await fetch(
          `https://vercel.com/api/web/insights/stats/path?teamSlug=&projectId=&${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          logger.warn("Analytics API error", { status: res.status });
          return null;
        }

        return await res.json();
      } catch (err) {
        logger.warn("Failed to fetch analytics", { error: String(err) });
        return null;
      }
    };

    const thisWeek = await fetchAnalytics(weekAgo, now);
    const lastWeek = await fetchAnalytics(twoWeeksAgo, weekAgo);

    if (!thisWeek) {
      logger.warn("Could not fetch analytics data");
      return { skipped: true, reason: "API error" };
    }

    // Build digest
    const topPages = thisWeek.data?.slice(0, 10) || [];
    const thisWeekTotal = topPages.reduce(
      (sum: number, p: { pageViews?: number }) => sum + (p.pageViews || 0),
      0
    );
    const lastWeekTotal = lastWeek?.data?.reduce(
      (sum: number, p: { pageViews?: number }) => sum + (p.pageViews || 0),
      0
    ) || 0;

    const trend =
      lastWeekTotal > 0
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : 0;
    const trendEmoji = trend > 0 ? "📈" : trend < 0 ? "📉" : "➡️";

    const pagesHtml = topPages
      .map(
        (p: { path?: string; pageViews?: number }, i: number) =>
          `<tr><td>${i + 1}</td><td>${p.path || "/"}</td><td>${p.pageViews || 0}</td></tr>`
      )
      .join("");

    await sendEmail({
      subject: `Weekly Analytics: ${thisWeekTotal} views ${trendEmoji} ${trend > 0 ? "+" : ""}${trend}%`,
      html: `
        <h2>Weekly Analytics Digest</h2>
        <p>${weekAgo.toISOString().split("T")[0]} - ${now.toISOString().split("T")[0]}</p>
        <h3>Summary</h3>
        <ul>
          <li><strong>Total views this week:</strong> ${thisWeekTotal}</li>
          <li><strong>Total views last week:</strong> ${lastWeekTotal}</li>
          <li><strong>Trend:</strong> ${trendEmoji} ${trend > 0 ? "+" : ""}${trend}%</li>
        </ul>
        <h3>Top Pages</h3>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr><th>#</th><th>Page</th><th>Views</th></tr>
          ${pagesHtml}
        </table>
        <hr>
        <p><em>From DAK Blog Automation</em></p>
      `,
    });

    return { totalViews: thisWeekTotal, trend, topPages: topPages.length };
  },
});
