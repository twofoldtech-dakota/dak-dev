/**
 * Content calendar sync
 *
 * Auto-updates content calendar status based on validation results.
 * On --fix mode: sets status to "ready" (passed) or "review" (failed).
 */

import fs from 'fs';
import path from 'path';

interface ContentPlanTopic {
  id: string;
  slug: string;
  status: string;
  [key: string]: unknown;
}

interface ContentPlan {
  topics: ContentPlanTopic[];
  [key: string]: unknown;
}

/**
 * Update a topic's status in the content calendar
 */
export function syncCalendarStatus(
  slug: string,
  validationPassed: boolean
): { updated: boolean; previousStatus: string | null; newStatus: string } {
  const calendarPath = path.join(process.cwd(), '.content/calendar/content-plan.json');

  if (!fs.existsSync(calendarPath)) {
    return { updated: false, previousStatus: null, newStatus: '' };
  }

  const plan: ContentPlan = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
  const topic = plan.topics.find((t) => t.slug === slug);

  if (!topic) {
    return { updated: false, previousStatus: null, newStatus: '' };
  }

  const previousStatus = topic.status;
  // Don't downgrade published posts
  if (previousStatus === 'published') {
    return { updated: false, previousStatus, newStatus: previousStatus };
  }

  const newStatus = validationPassed ? 'ready' : 'review';

  if (topic.status === newStatus) {
    return { updated: false, previousStatus, newStatus };
  }

  topic.status = newStatus;
  topic.updated_at = new Date().toISOString().split('T')[0];
  plan.topics = plan.topics.map((t) => (t.slug === slug ? topic : t));

  fs.writeFileSync(calendarPath, JSON.stringify(plan, null, 2) + '\n', 'utf8');

  return { updated: true, previousStatus, newStatus };
}
