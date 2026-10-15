import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscription } from "@/lib/db/schema";
import { syncResendContact } from "@/lib/newsletter";

/**
 * 退订链接处理：GET /api/newsletter/unsubscribe?token=xxx
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const [subscription] = await db
    .select()
    .from(newsletterSubscription)
    .where(eq(newsletterSubscription.unsubscribeToken, token))
    .limit(1);

  if (!subscription) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (subscription.status !== "unsubscribed") {
    await db
      .update(newsletterSubscription)
      .set({ status: "unsubscribed", unsubscribedAt: new Date() })
      .where(eq(newsletterSubscription.id, subscription.id));
  }

  // 无论本地是否已退订都尝试同步 Resend：
  // 上次同步失败时，用户再次打开退订链接即是重试，
  // 否则通过 Audience 群发时用户仍会继续收到邮件
  await syncResendContact(subscription.email, true);

  return new NextResponse(
    "<html><body style=\"font-family:sans-serif;text-align:center;padding-top:80px\"><h1>Unsubscribed</h1><p>You have been unsubscribed from the Toolso.AI newsletter.</p></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
