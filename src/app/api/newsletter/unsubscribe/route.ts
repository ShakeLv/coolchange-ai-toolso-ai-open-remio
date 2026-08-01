import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscription } from "@/lib/db/schema";

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

  return new NextResponse(
    "<html><body style=\"font-family:sans-serif;text-align:center;padding-top:80px\"><h1>Unsubscribed</h1><p>You have been unsubscribed from the Toolso.AI newsletter.</p></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
