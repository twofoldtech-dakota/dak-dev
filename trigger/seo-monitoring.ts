import { schedules, logger } from "@trigger.dev/sdk/v3";
import { sendEmail } from "./shared/email";

/**
 * SEO monitoring task
 * Checks keyword coverage, flags stale posts, validates internal linking.
 * Monday 8am CST = 14:00 UTC
 */
export const seoMonitoring = schedules.task({
  id: "seo-monitoring",
  cron: "0 14 * * 1",
  run: async () => {
    let getAllPosts: typeof import("../lib/posts").getAllPosts;
    let fs: typeof import("fs");
    let path: typeof import("path");

    try {
      const posts = await import("../lib/posts");
      getAllPosts = posts.getAllPosts;
      fs = await import("fs");
      path = await import("path");
    } catch {
      logger.warn("SEO monitoring skipped - modules not available in production");
      return { skipped: true, reason: "filesystem not available" };
    }

    const allPosts = getAllPosts();
    const issues: string[] = [];

    // Load SEO strategy
    let strategy: {
      target_keywords?: {
        primary?: Array<{ keyword: string; posts: string[] }>;
      };
      internal_linking_map?: Record<
        string,
        { outbound: string[]; inbound: string[]; recommended: string[] }
      >;
    } = {};

    try {
      const strategyPath = path.join(process.cwd(), ".content/seo/strategy.json");
      strategy = JSON.parse(fs.readFileSync(strategyPath, "utf8"));
    } catch {
      logger.warn("Could not load SEO strategy");
    }

    // Check 1: Stale posts (>90 days since publish)
    const now = new Date();
    const staleThreshold = 90;
    const stalePosts = allPosts.filter((p) => {
      const publishDate = new Date(p.frontmatter.date);
      const daysSince = Math.floor(
        (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince > staleThreshold;
    });

    if (stalePosts.length > 0) {
      issues.push(
        `<h3>Stale Posts (>${staleThreshold} days old)</h3><ul>${stalePosts.map((p) => `<li>${p.frontmatter.title} (${p.frontmatter.date})</li>`).join("")}</ul>`
      );
    }

    // Check 2: Keyword gaps - posts without keywords
    const postsWithoutKeywords = allPosts.filter(
      (p) => !p.frontmatter.keywords || p.frontmatter.keywords.length === 0
    );
    if (postsWithoutKeywords.length > 0) {
      issues.push(
        `<h3>Posts Missing Keywords</h3><ul>${postsWithoutKeywords.map((p) => `<li>${p.frontmatter.title}</li>`).join("")}</ul>`
      );
    }

    // Check 3: Internal linking coverage
    const linkRegex = /\[([^\]]*)\]\(\/blog\/([^)\s#?]+)\)/g;
    const postsWithFewLinks = allPosts.filter((p) => {
      const matches = [...p.content.matchAll(linkRegex)];
      return matches.length < 2;
    });

    if (postsWithFewLinks.length > 0) {
      issues.push(
        `<h3>Posts with &lt;2 Internal Links</h3><ul>${postsWithFewLinks.map((p) => `<li>${p.frontmatter.title} (${[...p.content.matchAll(linkRegex)].length} links)</li>`).join("")}</ul>`
      );
    }

    // Check 4: Strategy keyword coverage
    if (strategy.target_keywords?.primary) {
      const allSlugs = new Set(allPosts.map((p) => p.frontmatter.slug));
      const uncoveredKeywords = strategy.target_keywords.primary.filter(
        (kw) => !kw.posts.some((s) => allSlugs.has(s))
      );
      if (uncoveredKeywords.length > 0) {
        issues.push(
          `<h3>Uncovered Keywords</h3><ul>${uncoveredKeywords.map((kw) => `<li>${kw.keyword}</li>`).join("")}</ul>`
        );
      }
    }

    logger.info("SEO monitoring complete", { issueCount: issues.length });

    if (issues.length > 0) {
      await sendEmail({
        subject: `SEO Report: ${issues.length} issue(s) found`,
        html: `
          <h2>Weekly SEO Monitoring Report</h2>
          <p>${allPosts.length} published posts analyzed.</p>
          ${issues.join("")}
          <hr>
          <p><em>From DAK Blog Automation</em></p>
        `,
      });
    }

    return {
      postsAnalyzed: allPosts.length,
      issuesFound: issues.length,
      stalePosts: stalePosts.length,
    };
  },
});
