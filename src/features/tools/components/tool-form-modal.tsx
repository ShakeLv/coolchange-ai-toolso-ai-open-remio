"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/button";
import { X } from "lucide-react";
import {
  createTool,
  updateTool,
  getCategories,
  getTags,
  getToolRelations,
} from "@/features/tools/actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  featured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryData {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string | null;
}

interface TagData {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string | null;
}

interface ToolFormModalProps {
  tool: ToolData | null;
  onClose: () => void;
  onSave: (tool: ToolData) => void;
}

export function ToolFormModal({ tool, onClose, onSave }: ToolFormModalProps) {
  const t = useTranslations("Admin.toolsManagement.modal");
  const isEditing = !!tool;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);

  const [formData, setFormData] = useState({
    slug: tool?.slug || "",
    domain: tool?.domain || "",
    websiteUrl: tool?.websiteUrl || "",
    coverImageUrl: tool?.coverImageUrl || "",
    logoUrl: tool?.logoUrl || "",
    nameEn: tool?.nameEn || "",
    descriptionEn: tool?.descriptionEn || "",
    nameZh: tool?.nameZh || "",
    descriptionZh: tool?.descriptionZh || "",
    status: tool?.status || "draft",
    pricing: tool?.pricing || "",
    featured: tool?.featured || false,
    categoryIds: [] as string[],
    tagIds: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);

      // 编辑模式下，加载工具已关联的分类和标签
      if (tool) {
        const relations = await getToolRelations(tool.id);
        setFormData((prev) => ({
          ...prev,
          categoryIds: relations.categoryIds,
          tagIds: relations.tagIds,
        }));
      }
    };
    loadData();
  }, [tool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug || !formData.nameEn) {
      toast.error(t("requiredField"));
      return;
    }

    setLoading(true);
    try {
      if (isEditing && tool) {
        await updateTool({
          id: tool.id,
          ...formData,
          status: formData.status as "draft" | "published",
          pricing: (formData.pricing || null) as
            | "free"
            | "freemium"
            | "paid"
            | null,
          domain: formData.domain || undefined,
          websiteUrl: formData.websiteUrl || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          logoUrl: formData.logoUrl || undefined,
          descriptionEn: formData.descriptionEn || undefined,
          nameZh: formData.nameZh || undefined,
          descriptionZh: formData.descriptionZh || undefined,
        });
        onSave({
          ...tool,
          ...formData,
          pricing: formData.pricing || null,
          domain: formData.domain || null,
          websiteUrl: formData.websiteUrl || null,
          coverImageUrl: formData.coverImageUrl || null,
          logoUrl: formData.logoUrl || null,
          descriptionEn: formData.descriptionEn || null,
          nameZh: formData.nameZh || null,
          descriptionZh: formData.descriptionZh || null,
          updatedAt: new Date(),
        });
        toast.success(t("updated"));
      } else {
        const result = await createTool({
          ...formData,
          pricing: (formData.pricing || null) as
            | "free"
            | "freemium"
            | "paid"
            | null,
          domain: formData.domain || undefined,
          websiteUrl: formData.websiteUrl || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          logoUrl: formData.logoUrl || undefined,
          descriptionEn: formData.descriptionEn || undefined,
          nameZh: formData.nameZh || undefined,
          descriptionZh: formData.descriptionZh || undefined,
          status: formData.status as "draft" | "published",
        });
        onSave({
          id: result.id,
          ...formData,
          pricing: formData.pricing || null,
          domain: formData.domain || null,
          websiteUrl: formData.websiteUrl || null,
          coverImageUrl: formData.coverImageUrl || null,
          logoUrl: formData.logoUrl || null,
          descriptionEn: formData.descriptionEn || null,
          nameZh: formData.nameZh || null,
          descriptionZh: formData.descriptionZh || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(t("created"));
      }
    } catch (error) {
      toast.error(isEditing ? t("updateFailed") : t("createFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? t("editTitle") : t("addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t("basicInfo")}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("slug")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="my-tool"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("status")}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="draft">{t("statusDraft")}</option>
                  <option value="published">{t("statusPublished")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("pricing")}
                </label>
                <select
                  value={formData.pricing}
                  onChange={(e) =>
                    setFormData({ ...formData, pricing: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">{t("pricingNone")}</option>
                  <option value="free">{t("pricingFree")}</option>
                  <option value="freemium">{t("pricingFreemium")}</option>
                  <option value="paid">{t("pricingPaid")}</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  {t("featured")}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("nameEn")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  placeholder="My Tool"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("nameZh")}
                </label>
                <input
                  type="text"
                  value={formData.nameZh}
                  onChange={(e) =>
                    setFormData({ ...formData, nameZh: e.target.value })
                  }
                  placeholder="我的工具"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t("descriptionEn")}
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                placeholder="A brief description of the tool..."
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {t("descriptionZh")}
              </label>
              <textarea
                value={formData.descriptionZh}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionZh: e.target.value })
                }
                placeholder="工具的简要描述..."
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* 链接和图片 */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t("linksAndImages")}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("domain")}
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  placeholder="example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("websiteUrl")}
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("logoUrl")}
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("coverImageUrl")}
                </label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImageUrl: e.target.value })
                  }
                  placeholder="https://example.com/cover.png"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* 分类 */}
          {categories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">{t("categories")}</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${formData.categoryIds.includes(category.id)
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:bg-hover"
                      }`}
                  >
                    {category.nameZh || category.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">{t("tags")}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${formData.tagIds.includes(tag.id)
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:bg-hover"
                      }`}
                  >
                    {tag.nameZh || tag.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("saving") : isEditing ? t("saveChanges") : t("createTool")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // 使用 Portal 将弹窗渲染到 body，避免被父元素的 overflow 影响
  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
