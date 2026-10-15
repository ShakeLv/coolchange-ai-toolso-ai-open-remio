"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Loader2 } from "lucide-react";

import { getFavoriteTools } from "@/features/tools/actions/favorite-actions";

interface FavoriteTool {
  id: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
  nameEn: string;
  nameZh: string | null;
}

/**
 * 仪表盘"我的收藏"列表
 */
export function FavoriteToolsSection() {
  const t = useTranslations("dashboard.favorites");
  const locale = useLocale();
  const [tools, setTools] = useState<FavoriteTool[] | null>(null);

  useEffect(() => {
    getFavoriteTools().then(setTools);
  }, []);

  const getName = (tool: FavoriteTool) =>
    locale === "zh" && tool.nameZh ? tool.nameZh : tool.nameEn;

  return (
    <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500" />
        {t("title")}
      </h3>

      {tools === null ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tools.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Link
            href={`/${locale}/tools`}
            className="mt-3 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            {t("browseTools")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${locale}/tools/${tool.slug}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 hover:border-foreground/20 transition-colors"
            >
              {tool.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tool.logoUrl}
                  alt={getName(tool)}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-base font-bold text-muted-foreground">
                  {getName(tool).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {getName(tool)}
                </p>
                {tool.domain && (
                  <p className="truncate text-sm text-muted-foreground">
                    {tool.domain}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
