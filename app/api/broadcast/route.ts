import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import * as postmark from "postmark";

function getPmClient() {
  return new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.BROADCAST_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postTitle, postUrl, excerpt } = await req.json();
  if (!postTitle || !postUrl) {
    return NextResponse.json({ error: "postTitle and postUrl are required" }, { status: 400 });
  }

  const { data: subscribers, error } = await getSupabaseAdmin()
    .from("subscribers")
    .select("email");

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const BATCH_SIZE = 500;
  const batches = [];
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    batches.push(subscribers.slice(i, i + BATCH_SIZE));
  }

  let sent = 0;
  for (const batch of batches) {
    const messages = batch.map((sub) => ({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: sub.email,
      Subject: `New post: ${postTitle}`,
      TextBody: `${postTitle}\n\n${excerpt ?? ""}\n\nRead: ${postUrl}`,
      HtmlBody: `<h2>${postTitle}</h2>${excerpt ? `<p>${excerpt}</p>` : ""}<p><a href="${postUrl}">Read →</a></p>`,
      MessageStream: "broadcast",
    }));
    await getPmClient().sendEmailBatch(messages);
    sent += messages.length;
  }

  return NextResponse.json({ ok: true, sent });
}
