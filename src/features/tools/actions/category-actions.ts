"use server";

import { db } from "@/lib/db";
import { category, toolCategory, tool } from "@/lib/db/schema";
import { eq, asc, and, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

// 分类数据出现在首页、工具列表、ISR 分类落地页上，变更需全部失效
function revalidateCategoryPages() {
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/tools", "page");
  revalidatePath("/[locale]/category/[slug]", "page");
  revalidatePath("/[locale]/admin/categories", "page");
}
import { nanoid } from "nanoid";

// ========== 类型定义 ==========
export interface CreateCategoryInput {
  slug: string;
  icon?: string;
  sortOrder?: number;
  nameEn: string;
  descriptionEn?: string;
  nameZh?: string;
  descriptionZh?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

// ========== 查询操作 ==========

/**
 * 获取所有分类（前台）
 */
export async function getCategories() {
  const categories = await db
    .select()
    .from(category)
    .orderBy(asc(category.sortOrder), asc(category.nameEn));

  return categories;
}

/**
 * 获取分类及其工具数量
 */
export async function getCategoriesWithCount() {
  const result = await db
    .select({
      category,
      toolCount: sql<number>`count(${tool.id})`,
    })
    .from(category)
    .leftJoin(toolCategory, eq(category.id, toolCategory.categoryId))
    .leftJoin(
      tool,
      and(eq(toolCategory.toolId, tool.id), eq(tool.status, "published"))
    )
    .groupBy(category.id)
    .orderBy(asc(category.sortOrder), asc(category.nameEn));

  return result.map((r) => ({
    ...r.category,
    toolCount: Number(r.toolCount),
  }));
}

/**
 * 根据 slug 获取分类
 */
export async function getCategoryBySlug(slug: string) {
  const [result] = await db
    .select()
    .from(category)
    .where(eq(category.slug, slug))
    .limit(1);

  return result || null;
}

// ========== 管理操作 ==========

/**
 * 创建分类
 */
export async function createCategory(input: CreateCategoryInput) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const id = nanoid();

  await db.insert(category).values({
    id,
    ...input,
    sortOrder: input.sortOrder ?? 0,
  });

  revalidateCategoryPages();
  return { success: true, id };
}

/**
 * 更新分类
 */
export async function updateCategory(input: UpdateCategoryInput) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  const { id, ...data } = input;

  await db
    .update(category)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(category.id, id));

  revalidateCategoryPages();
  return { success: true };
}

/**
 * 删除分类
 */
export async function deleteCategory(id: string) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  // 删除分类会自动删除关联（级联删除）
  await db.delete(category).where(eq(category.id, id));

  revalidateCategoryPages();
  return { success: true };
}

/**
 * 批量更新分类排序
 */
export async function updateCategorySortOrder(
  items: { id: string; sortOrder: number }[]
) {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Unauthorized");
  }

  for (const item of items) {
    await db
      .update(category)
      .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
      .where(eq(category.id, item.id));
  }

  revalidateCategoryPages();
  return { success: true };
}
