import { notFound } from "next/navigation";
import Link from "next/link";
import { getToolBySlug } from "@/features/tools/actions";
import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/button";
import { SoftwareApplicationJsonLd } from "@/components/json-ld";
import { generatePageMetadata } from "@/lib/metadata";

interface ToolDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("tools");
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
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("tools");
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
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={name}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center">
                <span className="text-3xl font-bold text-muted-foreground">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
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
              <img
                src={tool.coverImageUrl}
                alt={name}
                className="w-full h-auto"
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
