"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { FavoriteButton } from "@/features/tools/components/favorite-button";
import { ToolLogo } from "@/components/tool-logo";

interface ToolData {
  id: string;
  slug: string;
  domain: string | null;
  websiteUrl: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  nameEn: string;
  descriptionEn: string | null;
  nameZh: string | null;
  descriptionZh: string | null;
  pricing: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryData {
  id: string;
  slug: string;
  icon: string | null;
  nameEn: string;
  nameZh: string | null;
  toolCount: number;
}

interface ToolsTranslations {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  all: string;
  foundTools: string;
  visitWebsite: string;
  noTools: string;
  pricingFree: string;
  pricingFreemium: string;
  pricingPaid: string;
}

interface ToolsListProps {
  tools: ToolData[];
  categories: CategoryData[];
  currentCategory?: string;
  currentPricing?: string;
  currentSearch?: string;
  currentPage: number;
  totalPages: number;
  total: number;
  locale: string;
  translations: ToolsTranslations;
}

export function ToolsList({
  tools,
  categories,
  currentCategory,
  currentPricing,
  currentSearch,
  currentPage,
  totalPages,
  total,
  locale,
  translations,
}: ToolsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentSearch || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/${locale}/tools?${params.toString()}`);
  };

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/${locale}/tools?${params.toString()}`);
  };

  const handlePricingChange = (pricing: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pricing) {
      params.set("pricing", pricing);
    } else {
      params.delete("pricing");
    }
    params.delete("page");
    router.push(`/${locale}/tools?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/${locale}/tools?${params.toString()}`);
  };

  const getName = (tool: ToolData) =>
    locale === "zh" && tool.nameZh ? tool.nameZh : tool.nameEn;

  const getDescription = (tool: ToolData) =>
    locale === "zh" && tool.descriptionZh
      ? tool.descriptionZh
      : tool.descriptionEn;

  const getCategoryName = (category: CategoryData) =>
    locale === "zh" && category.nameZh ? category.nameZh : category.nameEn;

  const pricingLabels: Record<string, string> = {
    free: translations.pricingFree,
    freemium: translations.pricingFreemium,
    paid: translations.pricingPaid,
  };

  return (
    <div className="space-y-6">
      {/* 搜索框和分类筛选 */}
      <div className="flex flex-col gap-4">
        {/* 第一行：搜索框 + 结果统计 */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder={translations.searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full py-2.5 bg-transparent text-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {translations.foundTools}
          </div>
        </div>

        {/* 第二行：分类筛选 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !currentCategory
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-hover"
            }`}
          >
            {translations.all}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentCategory === category.slug
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-hover"
              }`}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {getCategoryName(category)} ({category.toolCount})
            </button>
          ))}
        </div>

        {/* 第三行：定价筛选 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePricingChange(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !currentPricing
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-hover"
            }`}
          >
            {translations.all}
          </button>
          {(["free", "freemium", "paid"] as const).map((pricing) => (
            <button
              key={pricing}
              onClick={() => handlePricingChange(pricing)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                currentPricing === pricing
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:bg-hover"
              }`}
            >
              {pricingLabels[pricing]}
            </button>
          ))}
        </div>
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
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
              <FavoriteButton toolId={tool.id} />
            </div>

            {getDescription(tool) && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {getDescription(tool)}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              {tool.websiteUrl ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span>{translations.visitWebsite}</span>
                </div>
              ) : (
                <span />
              )}
              {tool.pricing && pricingLabels[tool.pricing] && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {pricingLabels[tool.pricing]}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 空状态 */}
      {tools.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            {translations.noTools}
          </p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, arr) => {
                const prevPage = arr[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-foreground text-background"
                          : "hover:bg-hover"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
