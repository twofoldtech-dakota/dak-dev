import { schedules, logger } from "@trigger.dev/sdk/v3";
import { sendEmail } from "./shared/email";

/**
 * Scheduled content validation
 * Runs all validators on published posts and reports degradation.
 * Daily at 2am CST = 08:00 UTC
 */
export const contentValidation = schedules.task({
  id: "content-validation",
  cron: "0 8 * * *",
  run: async () => {
    // This task reads from filesystem - only works in dev mode
    let validatePost: typeof import("../lib/content-validation").validatePost;
    let getAllPosts: typeof import("../lib/posts").getAllPosts;

    try {
      const validation = await import("../lib/content-validation");
      const posts = await import("../lib/posts");
      validatePost = validation.validatePost;
      getAllPosts = posts.getAllPosts;
    } catch {
      logger.warn("Content validation skipped - modules not available in production");
      return { skipped: true, reason: "filesystem not available" };
    }

    const allPosts = getAllPosts();
    logger.info(`Validating ${allPosts.length} published posts`);

    const failures: Array<{
      slug: string;
      title: string;
      score: number;
      issueCount: number;
    }> = [];

    for (const post of allPosts) {
      const result = await validatePost(post.frontmatter.slug);

      if (!result.passed) {
        failures.push({
          slug: post.frontmatter.slug,
          title: post.frontmatter.title,
          score: result.score,
          issueCount: result.issues.length,
        });
      }

      logger.info(`Validated: ${post.frontmatter.slug}`, {
        score: result.score,
        passed: result.passed,
        issues: result.issues.length,
      });
    }

    // Only send email on failures
    if (failures.length > 0) {
      const rows = failures
        .map(
          (f) =>
            `<tr><td>${f.title}</td><td>${f.score}/100</td><td>${f.issueCount}</td></tr>`
        )
        .join("");

      await sendEmail({
        subject: `Content Alert: ${failures.length} post(s) failing validation`,
        html: `
          <h2>Content Validation Report</h2>
          <p>${allPosts.length} posts checked, ${failures.length} failing:</p>
          <table border="1" cellpadding="8" cellspacing="0">
            <tr><th>Post</th><th>Score</th><th>Issues</th></tr>
            ${rows}
          </table>
          <p>Run <code>npm run publish:prepare</code> locally for details.</p>
          <hr>
          <p><em>From DAK Blog Automation</em></p>
        `,
      });
    }

    return {
      total: allPosts.length,
      passed: allPosts.length - failures.length,
      failed: failures.length,
    };
  },
});
