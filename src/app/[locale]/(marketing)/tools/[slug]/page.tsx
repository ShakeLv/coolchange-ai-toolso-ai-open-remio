import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tool as toolTable } from "@/lib/db/schema";
import { getToolBySlug } from "@/features/tools/actions";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n.config";
import { ExternalLink, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/button";
import { SoftwareApplicationJsonLd } from "@/components/json-ld";
import { generatePageMetadata } from "@/lib/metadata";
import {
  FavoritesProvider,
  FavoriteButton,
} from "@/features/tools/components/favorite-button";
import { ToolLogo } from "@/components/tool-logo";

interface ToolDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// 工具详情内容基本不变，ISR 每小时再生；后台变更会触发 revalidatePath
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const tools = await db
      .select({ slug: toolTable.slug })
      .from(toolTable)
      .where(eq(toolTable.status, "published"));

    return tools.flatMap((t) =>
      locales.map((locale) => ({ locale, slug: t.slug }))
    );
  } catch {
    // 构建时数据库不可用（如 Docker 构建），改为运行时按需生成
    return [];
  }
}

export async function generateMetadata({ params }: ToolDetailPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return {
      title: t("notFound"),
    };
  }

  const name = locale === "zh" && tool.nameZh ? tool.nameZh : tool.nameEn;
  const description =
    locale === "zh" && tool.descriptionZh
      ? tool.descriptionZh
      : tool.descriptionEn;

  return generatePageMetadata({
    locale,
    path: `/tools/${slug}`,
    title: `${name} - ${t("title")}`,
    description: description || `${t("subtitle")} - ${name}`,
    ogImage: tool.coverImageUrl || tool.logoUrl || undefined,
  });
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const name = locale === "zh" && tool.nameZh ? tool.nameZh : tool.nameEn;
  const description =
    locale === "zh" && tool.descriptionZh
      ? tool.descriptionZh
      : tool.descriptionEn;

  const getCategoryName = (category: { nameEn: string; nameZh: string | null }) =>
    locale === "zh" && category.nameZh ? category.nameZh : category.nameEn;

  const getTagName = (tag: { nameEn: string; nameZh: string | null }) =>
    locale === "zh" && tag.nameZh ? tag.nameZh : tag.nameEn;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolso.ai';
  const primaryCategory = tool.categories?.[0]?.nameEn;

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Structured Data for AI Tool */}
      <SoftwareApplicationJsonLd
        name={name}
        description={description || ''}
        url={tool.websiteUrl || `${baseUrl}/${locale}/tools/${slug}`}
        image={tool.logoUrl || tool.coverImageUrl || undefined}
        category={primaryCategory}
        applicationCategory="AI Tool"
      />

      {/* 返回按钮 */}
      <Link
        href={`/${locale}/tools`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToTools")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 主内容区 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 工具头部 */}
          <div className="flex items-start gap-6">
            <ToolLogo src={tool.logoUrl} alt={name} size={80} className="rounded-2xl" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {name}
              </h1>
              {tool.domain && (
                <p className="text-muted-foreground">{tool.domain}</p>
              )}
            </div>
          </div>

          {/* 封面图 */}
          {tool.coverImageUrl && (
            <div className="rounded-xl overflow-hidden border border-border">
              <Image
                src={tool.coverImageUrl}
                alt={name}
                width={1200}
                height={630}
                className="w-full h-auto"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
          )}

          {/* 描述 */}
          {description && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("about")}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* 分类 */}
          {tool.categories && tool.categories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("categories")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {tool.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${locale}/tools?category=${category.slug}`}
                    className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-hover transition-colors"
                  >
                    {category.icon && (
                      <span className="mr-2">{category.icon}</span>
                    )}
                    {getCategoryName(category)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {tool.tags && tool.tags.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("tags")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground"
                  >
                    <Tag className="h-3 w-3" />
                    {getTagName(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* 访问按钮 */}
            {tool.websiteUrl && (
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("visitButton")}
                </Button>
              </a>
            )}

            {/* 收藏按钮 */}
            <FavoritesProvider>
              <FavoriteButton toolId={tool.id} appearance="button" />
            </FavoritesProvider>

            {/* 工具信息卡片 */}
            <div className="bg-secondary rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                {t("toolInfo")}
              </h3>

              {tool.domain && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("domain")}
                  </p>
                  <p className="text-foreground">{tool.domain}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">
                  {t("added")}
                </p>
                <p className="text-foreground">
                  {new Date(tool.createdAt).toLocaleDateString(
                    locale === "zh" ? "zh-CN" : "en-US"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
