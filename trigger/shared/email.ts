/**
 * Shared email utility for Trigger.dev tasks
 *
 * Graceful no-op if RESEND_API_KEY is not configured.
 * All tasks can call sendEmail() without worrying about env setup.
 */

import { Resend } from "resend";
import { logger } from "@trigger.dev/sdk/v3";

interface EmailOptions {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email notification. Returns true on success or skip.
 * Never throws - logs and returns false on failure.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;

  if (!apiKey) {
    logger.info("Email skipped: RESEND_API_KEY not configured");
    return true;
  }

  if (!to) {
    logger.info("Email skipped: NOTIFICATION_EMAIL not configured");
    return true;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "DAK Blog <notifications@resend.dev>",
      to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info("Email sent", { subject: options.subject, to });
    return true;
  } catch (error) {
    logger.error("Failed to send email", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
