import { getPublishedTools, getCategoriesWithCount } from "@/features/tools/actions";
import { ToolsList } from "@/features/tools/components/tools-list";
import { CollectionPageJsonLd } from "@/components/json-ld";
import { getLocale, getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.tools" });
  return generatePageMetadata({
    locale,
    path: "/tools",
    title: t("title"),
    description: t("description"),
  });
}

interface ToolsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("tools");
  const page = parseInt(params.page || "1", 10);
  const categorySlug = params.category;
  const search = params.search;

  // 获取分类列表用于筛选
  const categories = await getCategoriesWithCount();

  // 找到对应的 categoryId
  let categoryId: string | undefined;
  if (categorySlug) {
    const category = categories.find((c) => c.slug === categorySlug);
    categoryId = category?.id;
  }

  // 获取工具列表
  const { tools, total, pageSize } = await getPublishedTools({
    page,
    pageSize: 12,
    categoryId,
    search,
  });

  const totalPages = Math.ceil(total / pageSize);

  // 准备翻译文本传递给客户端组件
  const translations = {
    title: t("title"),
    subtitle: t("subtitle"),
    searchPlaceholder: t("searchPlaceholder"),
    all: t("all"),
    foundTools: t("foundTools", { count: total }),
    visitWebsite: t("visitWebsite"),
    noTools: t("noTools"),
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolso.ai';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Structured Data for AI Tools Directory */}
      <CollectionPageJsonLd
        name={translations.title}
        description={translations.subtitle}
        url={`${baseUrl}/${locale}/tools`}
        itemCount={total}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {translations.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {translations.subtitle}
        </p>
      </div>

      <ToolsList
        tools={tools}
        categories={categories}
        currentCategory={categorySlug}
        currentSearch={search}
        currentPage={page}
        totalPages={totalPages}
        total={total}
        locale={locale}
        translations={translations}
      />
    </div>
  );
}
