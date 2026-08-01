"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/button";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  deleteTool,
  updateToolStatus,
  type ToolStatus,
} from "@/features/tools/actions";
import { toast } from "sonner";
import { ToolFormModal } from "./tool-form-modal";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

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

interface ToolsTableProps {
  tools: ToolData[];
}

export function ToolsTable({ tools: initialTools }: ToolsTableProps) {
  const t = useTranslations("Admin.toolsManagement");
  const locale = useLocale();
  const [tools, setTools] = useState(initialTools);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ToolStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolData | null>(null);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.nameZh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || tool.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tools, searchTerm, statusFilter]);

  const toolsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / toolsPerPage));
  const startIndex = (currentPage - 1) * toolsPerPage;
  const paginatedTools = filteredTools.slice(
    startIndex,
    startIndex + toolsPerPage
  );

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const halfWindow = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - halfWindow);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("confirmDelete", { name }))) {
      return;
    }

    try {
      await deleteTool(id);
      setTools(tools.filter((t) => t.id !== id));
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus: ToolStatus =
      currentStatus === "published" ? "draft" : "published";

    try {
      await updateToolStatus(id, newStatus);
      setTools(
        tools.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("statusUpdateFailed"));
    }
  };

  const handleEdit = (tool: ToolData) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTool(null);
  };

  const handleToolSaved = (savedTool: ToolData) => {
    if (editingTool) {
      setTools(tools.map((t) => (t.id === savedTool.id ? savedTool : t)));
    } else {
      setTools([savedTool, ...tools]);
    }
    handleModalClose();
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 max-w-md px-4 border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 bg-transparent text-foreground focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ToolStatus | "all")
          }
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="all">{t("allStatus")}</option>
          <option value="published">{t("published")}</option>
          <option value="draft">{t("draft")}</option>
        </select>

        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addTool")}
        </Button>
      </div>

      {/* 工具表格 */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("tool")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("slug")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("createdAt")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTools.map((tool) => (
                <tr key={tool.id} className="hover:bg-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {tool.logoUrl ? (
                        <img
                          src={tool.logoUrl}
                          alt={tool.nameEn}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <span className="text-lg font-bold text-muted-foreground">
                            {tool.nameEn.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/${locale}/tools/${tool.slug}`} target="_blank"
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {tool.nameEn}
                        </Link>
                        {tool.nameZh && (
                          <div className="text-sm text-muted-foreground">
                            {tool.nameZh}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">
                      {tool.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {tool.status === "published" ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {t("published")}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        {t("draft")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(tool.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(tool.id, tool.status)}
                        className="p-1.5 rounded hover:bg-hover text-muted-foreground"
                        title={
                          tool.status === "published" ? t("toDraft") : t("publish")
                        }
                      >
                        {tool.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(tool)}
                        className="p-1.5 rounded hover:bg-hover text-muted-foreground"
                        title={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {tool.websiteUrl && (
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-hover text-muted-foreground"
                          title={t("visitWebsite")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(tool.id, tool.nameEn)}
                        className="p-1.5 rounded hover:bg-hover text-red-600 dark:text-red-400"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedTools.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {filteredTools.length > 0 && (
          <nav className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-muted-foreground hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("previous")}
            </button>

            <div className="flex items-center gap-2">
              {pageNumbers[0] > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:bg-hover ${currentPage === 1
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                    }`}
                >
                  1
                </button>
              )}
              {pageNumbers[0] > 2 && (
                <span className="text-sm text-muted-foreground">...</span>
              )}

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:bg-hover ${currentPage === pageNumber
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="text-sm text-muted-foreground">...</span>
              )}
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:bg-hover ${currentPage === totalPages
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                    }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-muted-foreground hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("next")}
            </button>
          </nav>
        )}
      </div>

      {/* 工具编辑模态框 */}
      {isModalOpen && (
        <ToolFormModal
          tool={editingTool}
          onClose={handleModalClose}
          onSave={handleToolSaved}
        />
      )}
    </div>
  );
}
