import { NextResponse } from "next/server";

interface PostPublishBody {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
}

export async function POST(request: Request) {
  // Gracefully skip if Trigger.dev is not configured
  if (!process.env.TRIGGER_SECRET_KEY) {
    return NextResponse.json(
      { skipped: true, reason: "Trigger.dev not configured" },
      { status: 200 }
    );
  }

  let body: PostPublishBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, title, excerpt, tags, date } = body;

  if (!slug || !title) {
    return NextResponse.json(
      { error: "slug and title are required" },
      { status: 400 }
    );
  }

  try {
    // Dynamic import to avoid build errors when Trigger.dev isn't set up
    const { tasks } = await import("@trigger.dev/sdk/v3");
    const { postPublish } = await import("../../../../trigger/post-publish");

    const handle = await tasks.trigger(postPublish.id, {
      slug,
      title,
      excerpt: excerpt || "",
      tags: tags || [],
      date: date || new Date().toISOString(),
    });

    return NextResponse.json({
      triggered: true,
      runId: handle.id,
    });
  } catch (error) {
    console.error("Failed to trigger post-publish task:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger task",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
