"use server";

import { db } from "@/lib/db";
import { favorite, tool } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

/**
 * 收藏/取消收藏（登录用户）
 */
export async function toggleFavorite(toolId: string) {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false as const, error: "UNAUTHORIZED" };
  }

  const [existing] = await db
    .select({ toolId: favorite.toolId })
    .from(favorite)
    .where(and(eq(favorite.userId, userId), eq(favorite.toolId, toolId)))
    .limit(1);

  if (existing) {
    await db
      .delete(favorite)
      .where(and(eq(favorite.userId, userId), eq(favorite.toolId, toolId)));
    return { success: true as const, favorited: false };
  }

  await db.insert(favorite).values({ userId, toolId }).onConflictDoNothing();
  return { success: true as const, favorited: true };
}

/**
 * 当前用户收藏的工具 ID 列表（未登录返回空）
 */
export async function getFavoriteToolIds(): Promise<string[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const rows = await db
    .select({ toolId: favorite.toolId })
    .from(favorite)
    .where(eq(favorite.userId, userId));

  return rows.map((r) => r.toolId);
}

/**
 * 当前用户收藏的工具详情列表（仪表盘）
 */
export async function getFavoriteTools() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const rows = await db
    .select({ tool, favoritedAt: favorite.createdAt })
    .from(favorite)
    .innerJoin(tool, eq(favorite.toolId, tool.id))
    .where(eq(favorite.userId, userId))
    .orderBy(desc(favorite.createdAt));

  return rows.map((row) => ({ ...row.tool, favoritedAt: row.favoritedAt }));
}
