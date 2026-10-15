"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import {
  getFavoriteToolIds,
  toggleFavorite,
} from "@/features/tools/actions/favorite-actions";
import { cn } from "@/lib/utils";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isAuthenticated: boolean;
  toggle: (toolId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * 客户端拉取收藏状态（页面本身可被 ISR 缓存，收藏状态不能进服务端渲染结果）
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("tools.favorites");
  const isAuthenticated = !!session.data?.user;
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session.isPending) return;
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    getFavoriteToolIds().then((ids) => setFavoriteIds(new Set(ids)));
  }, [isAuthenticated, session.isPending]);

  const toggle = useCallback(
    (toolId: string) => {
      if (!isAuthenticated) {
        toast(t("loginRequired"));
        router.push(`/${locale}/login`);
        return;
      }

      // 单个工具同一时刻只允许一个进行中的请求，防止连点竞态
      if (pendingIds.has(toolId)) return;
      setPendingIds((prev) => new Set(prev).add(toolId));

      // 乐观更新；响应到达后以服务端返回的最终状态收敛
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(toolId)) {
          next.delete(toolId);
        } else {
          next.add(toolId);
        }
        return next;
      });

      toggleFavorite(toolId)
        .then((result) => {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (result.success) {
              if (result.favorited) {
                next.add(toolId);
              } else {
                next.delete(toolId);
              }
            } else {
              // 失败回滚乐观更新
              if (next.has(toolId)) {
                next.delete(toolId);
              } else {
                next.add(toolId);
              }
            }
            return next;
          });
          if (!result.success) toast.error(t("error"));
        })
        .finally(() => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(toolId);
            return next;
          });
        });
    },
    [isAuthenticated, locale, pendingIds, router, t]
  );

  const value = useMemo(
    () => ({ favoriteIds, isAuthenticated, toggle }),
    [favoriteIds, isAuthenticated, toggle]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

interface FavoriteButtonProps {
  toolId: string;
  appearance?: "icon" | "button";
}

export function FavoriteButton({
  toolId,
  appearance = "icon",
}: FavoriteButtonProps) {
  const ctx = useContext(FavoritesContext);
  const t = useTranslations("tools.favorites");

  if (!ctx) return null;

  const favorited = ctx.favoriteIds.has(toolId);

  if (appearance === "button") {
    return (
      <button
        type="button"
        onClick={() => ctx.toggle(toolId)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
          favorited
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            : "border-border text-foreground hover:bg-hover"
        )}
      >
        <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
        {favorited ? t("remove") : t("add")}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={favorited ? t("remove") : t("add")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ctx.toggle(toolId);
      }}
      className={cn(
        "rounded-full p-2 transition-colors",
        favorited
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground/50 hover:text-red-500"
      )}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
    </button>
  );
}
