"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Heading } from "./heading";
import { Subheading } from "./subheading";
import { ToolLogo } from "./tool-logo";

interface ToolData {
  id: string;
  slug: string;
  domain: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  nameEn: string;
  descriptionEn: string | null;
  nameZh: string | null;
  descriptionZh: string | null;
}

interface CategoryData {
  id: string;
  slug: string;
  icon: string | null;
  nameEn: string;
  nameZh: string | null;
  toolCount: number;
}

interface FeaturedToolsProps {
  tools: ToolData[];
  categories: CategoryData[];
}

export function FeaturedTools({ tools, categories }: FeaturedToolsProps) {
  const locale = useLocale();
  const t = useTranslations("featuredTools");

  const getName = (item: { nameEn: string; nameZh: string | null }) =>
    locale === "zh" && item.nameZh ? item.nameZh : item.nameEn;

  const getDescription = (tool: ToolData) =>
    locale === "zh" && tool.descriptionZh
      ? tool.descriptionZh
      : tool.descriptionEn;

  return (
    <div className="relative z-20">
      <Heading as="h2">{t("title")}</Heading>
      <Subheading className="text-center">{t("subtitle")}</Subheading>

      {/* 分类导航 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/tools?category=${category.slug}`}
              className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-hover transition-colors text-sm font-medium"
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {getName(category)}
              <span className="ml-1 text-muted-foreground">
                ({category.toolCount})
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* 工具网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
        {tools.slice(0, 8).map((tool) => (
          <Link
            key={tool.id}
            href={`/${locale}/tools/${tool.slug}`}
            className="group bg-background rounded-xl border border-border p-5 hover:shadow-lg transition-all hover:border-foreground/20"
          >
            <div className="flex items-start gap-4">
              <ToolLogo src={tool.logoUrl} alt={getName(tool)} size={48} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary truncate">
                  {getName(tool)}
                </h3>
                {tool.domain && (
                  <p className="text-sm text-muted-foreground truncate">
                    {tool.domain}
                  </p>
                )}
              </div>
            </div>

            {getDescription(tool) && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
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

      {/* 空状态 */}
      {tools.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          {t("empty")}
        </div>
      )}

      {/* 查看更多按钮 */}
      {tools.length > 0 && (
        <div className="flex justify-center mt-12">
          <Link
            href={`/${locale}/tools`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity font-medium"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
