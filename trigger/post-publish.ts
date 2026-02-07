import { task, logger } from "@trigger.dev/sdk/v3";
import { sendEmail } from "./shared/email";

interface PostPublishPayload {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
}

/**
 * Post-publish workflow
 * - Pings Google/Bing sitemaps
 * - Generates social media snippets
 * - Sends publish notification email
 */
export const postPublish = task({
  id: "post-publish",
  run: async (payload: PostPublishPayload) => {
    const { slug, title, excerpt, tags, date } = payload;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dak-dev.vercel.app";
    const postUrl = `${siteUrl}/blog/${slug}`;
    const sitemapUrl = `${siteUrl}/sitemap.xml`;

    // Step 1: Ping search engines
    const pings: Record<string, boolean> = {};

    try {
      const googleRes = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      );
      pings.google = googleRes.ok;
      logger.info("Google sitemap ping", { status: googleRes.status });
    } catch (err) {
      pings.google = false;
      logger.warn("Google ping failed", { error: String(err) });
    }

    try {
      const bingRes = await fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      );
      pings.bing = bingRes.ok;
      logger.info("Bing sitemap ping", { status: bingRes.status });
    } catch (err) {
      pings.bing = false;
      logger.warn("Bing ping failed", { error: String(err) });
    }

    // Step 2: Generate social media snippets
    const tagString = tags.map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, "")}`).join(" ");
    const socialSnippets = {
      twitter: `${title}\n\n${excerpt}\n\n${postUrl}\n\n${tagString}`.slice(0, 280),
      linkedin: `${title}\n\n${excerpt}\n\nRead more: ${postUrl}\n\n${tagString}`,
      bluesky: `${title}\n\n${excerpt}\n\n${postUrl}`.slice(0, 300),
    };

    logger.info("Social snippets generated", { socialSnippets });

    // Step 3: Send notification email
    await sendEmail({
      subject: `Published: ${title}`,
      html: `
        <h2>New Post Published</h2>
        <p><strong>${title}</strong></p>
        <p>${excerpt}</p>
        <p><a href="${postUrl}">View post</a> | Published ${date}</p>
        <h3>Search Engine Pings</h3>
        <ul>
          <li>Google: ${pings.google ? "Pinged" : "Failed"}</li>
          <li>Bing: ${pings.bing ? "Pinged" : "Failed"}</li>
        </ul>
        <h3>Social Media Snippets</h3>
        <h4>Twitter/X</h4>
        <pre>${socialSnippets.twitter}</pre>
        <h4>LinkedIn</h4>
        <pre>${socialSnippets.linkedin}</pre>
        <h4>Bluesky</h4>
        <pre>${socialSnippets.bluesky}</pre>
        <hr>
        <p><em>From DAK Blog Automation</em></p>
      `,
    });

    return { pings, socialSnippets, postUrl };
  },
});
