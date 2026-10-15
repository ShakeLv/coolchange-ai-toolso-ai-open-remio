import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { category as categoryTable } from "@/lib/db/schema";
import {
  getCategoryBySlug,
  getPublishedTools,
} from "@/features/tools/actions";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n.config";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CollectionPageJsonLd } from "@/components/json-ld";
import { ToolLogo } from "@/components/tool-logo";
import {
  FavoritesProvider,
  FavoriteButton,
} from "@/features/tools/components/favorite-button";
import { absoluteUrl, generatePageMetadata } from "@/lib/metadata";

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// 分类落地页走 ISR，工具增删时由 revalidatePath 触发更新
export const revalidate = 3600;

const PAGE_SIZE = 24;

export async function generateStaticParams() {
  try {
    const categories = await db
      .select({ slug: categoryTable.slug })
      .from(categoryTable);

    return categories.flatMap((c) =>
      locales.map((locale) => ({ locale, slug: c.slug }))
    );
  } catch {
    // 构建时数据库不可用（如 Docker 构建），改为运行时按需生成
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug, locale } = await params;
  const category = await getCategoryBySlug(slug);
  const t = await getTranslations({ locale, namespace: "tools" });

  if (!category) {
    return { title: t("notFound") };
  }

  const name =
    locale === "zh" && category.nameZh ? category.nameZh : category.nameEn;
  const description =
    locale === "zh" && category.descriptionZh
      ? category.descriptionZh
      : category.descriptionEn;

  return generatePageMetadata({
    locale,
    path: `/category/${slug}`,
    title: `${name} - ${t("title")}`,
    description: description || `${t("subtitle")} - ${name}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  const { tools, total } = await getPublishedTools({
    page: 1,
    pageSize: PAGE_SIZE,
    categoryId: category.id,
  });

  const name =
    locale === "zh" && category.nameZh ? category.nameZh : category.nameEn;
  const description =
    locale === "zh" && category.descriptionZh
      ? category.descriptionZh
      : category.descriptionEn;

  const getName = (tool: { nameEn: string; nameZh: string | null }) =>
    locale === "zh" && tool.nameZh ? tool.nameZh : tool.nameEn;
  const getDescription = (tool: {
    descriptionEn: string | null;
    descriptionZh: string | null;
  }) =>
    locale === "zh" && tool.descriptionZh
      ? tool.descriptionZh
      : tool.descriptionEn;

  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <CollectionPageJsonLd
        name={name}
        description={description || name}
        url={absoluteUrl(locale, `/category/${slug}`)}
        itemCount={total}
      />

      {/* 分类头部 */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        {category.icon && <div className="text-5xl">{category.icon}</div>}
        <h1 className="mt-4 text-4xl font-bold text-foreground">{name}</h1>
        {description && (
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {t("foundTools", { count: total })}
        </p>
      </div>

      {/* 工具网格 */}
      <FavoritesProvider>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${locale}/tools/${tool.slug}`}
              className="group rounded-xl border border-border bg-background p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <ToolLogo src={tool.logoUrl} alt={getName(tool)} size={48} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
                    {getName(tool)}
                  </h3>
                  {tool.domain && (
                    <p className="truncate text-sm text-muted-foreground">
                      {tool.domain}
                    </p>
                  )}
                </div>
                <FavoriteButton toolId={tool.id} />
              </div>

              {getDescription(tool) && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {getDescription(tool)}
                </p>
              )}

              {tool.websiteUrl && (
                <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span>{t("visitWebsite")}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </FavoritesProvider>

      {/* 空状态 */}
      {tools.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          {t("noTools")}
        </div>
      )}

      {/* 查看全部 */}
      {total > PAGE_SIZE && (
        <div className="mt-12 flex justify-center">
          <Link
            href={`/${locale}/tools?category=${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("categoryPage.viewAll", { count: total })}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
