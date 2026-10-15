"use server";

import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscription } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { syncResendContact } from "@/lib/newsletter";

const emailSchema = z.string().email().max(255);

export async function subscribeNewsletter(email: string) {
  const parsed = emailSchema.safeParse(email?.trim().toLowerCase());
  if (!parsed.success) {
    return { success: false as const, error: "INVALID_EMAIL" };
  }
  const normalizedEmail = parsed.data;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  try {
    const [existing] = await db
      .select()
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.email, normalizedEmail))
      .limit(1);

    if (existing) {
      if (existing.status === "unsubscribed") {
        await db
          .update(newsletterSubscription)
          .set({
            status: "active",
            subscribedAt: new Date(),
            unsubscribedAt: null,
            userId: userId ?? existing.userId,
          })
          .where(eq(newsletterSubscription.id, existing.id));
      }
      // 已订阅用户重复提交同样触发同步——这是此前同步失败后的重试路径，
      // 不能提前返回跳过（重新订阅场景也依赖它恢复 Resend 侧状态）
      await syncResendContact(normalizedEmail, false);
      return { success: true as const };
    }

    await db.insert(newsletterSubscription).values({
      id: nanoid(),
      email: normalizedEmail,
      userId,
      status: "active",
      unsubscribeToken: nanoid(32),
    });
  } catch (error) {
    console.error("Newsletter subscribe failed:", error);
    return { success: false as const, error: "SAVE_FAILED" };
  }

  // 可选：同步到 Resend Audience，失败不影响本地订阅结果
  await syncResendContact(normalizedEmail, false);

  return { success: true as const };
}
