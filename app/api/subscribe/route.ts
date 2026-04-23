import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import * as postmark from "postmark";

function getPmClient() {
  return new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);
}

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("subscribers")
    .insert({ email, source: source ?? "blog" });

  if (error) {
    if (error.code === "23505") {
      // already subscribed — treat as success, no email
      return NextResponse.json({ ok: true });
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  try {
    await getPmClient().sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: email,
      Subject: "You're in.",
      TextBody: `You'll hear from me when something worth reading is out. No noise.\n\n— Kuang`,
      HtmlBody: `<p>You'll hear from me when something worth reading is out. No noise.</p><p>— Kuang</p>`,
      MessageStream: "outbound",
    });
  } catch (err) {
    console.error("Postmark error:", err);
    // DB insert succeeded; don't fail the request over email
  }

  return NextResponse.json({ ok: true });
}
