import { NextResponse } from "next/server";
import { getAttachment } from "@/lib/db/queries";

// Slack files require a bearer token to fetch. We proxy them so the browser
// never sees the bot token. The proxy gates this route via the session cookie.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const att = await getAttachment(id);
  if (!att) return new NextResponse("not found", { status: 404 });

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return new NextResponse("missing token", { status: 500 });

  const upstream = await fetch(att.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("upstream error", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": att.mimetype ?? upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
