import { MetadataRoute } from 'next'
import { eq } from 'drizzle-orm'

// 每小时重新生成，保证新收录的工具能进入 sitemap
export const revalidate = 3600
import { db } from '@/lib/db'
import { tool, category } from '@/lib/db/schema'
import { getAllBlogs } from '@/lib/blog'
import { locales } from '@/i18n.config'
import { absoluteUrl } from '@/lib/metadata'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes with SEO priority for AI tools directory
  const staticRoutes = [
    { path: '', changeFreq: 'daily' as const, priority: 1.0 },
    { path: '/tools', changeFreq: 'daily' as const, priority: 0.95 },
    { path: '/blog', changeFreq: 'weekly' as const, priority: 0.8 },
    { path: '/contact', changeFreq: 'monthly' as const, priority: 0.5 },
    { path: '/privacy', changeFreq: 'monthly' as const, priority: 0.3 },
    { path: '/terms', changeFreq: 'monthly' as const, priority: 0.3 },
    { path: '/cookies', changeFreq: 'monthly' as const, priority: 0.3 },
  ]

  const [tools, categories, blogs] = await Promise.all([
    db
      .select({ slug: tool.slug, updatedAt: tool.updatedAt })
      .from(tool)
      .where(eq(tool.status, 'published')),
    db.select({ slug: category.slug, updatedAt: category.updatedAt }).from(category),
    getAllBlogs(),
  ])

  const dynamicRoutes = [
    ...tools.map((t) => ({
      path: `/tools/${t.slug}`,
      changeFreq: 'weekly' as const,
      priority: 0.9,
      lastModified: t.updatedAt,
    })),
    ...categories.map((c) => ({
      path: `/category/${c.slug}`,
      changeFreq: 'daily' as const,
      priority: 0.85,
      lastModified: c.updatedAt,
    })),
    ...blogs.map((b) => ({
      path: `/blog/${b.slug}`,
      changeFreq: 'monthly' as const,
      priority: 0.7,
      lastModified: b.date ? new Date(b.date) : undefined,
    })),
  ]

  const allRoutes = [
    ...staticRoutes.map((r) => ({ ...r, lastModified: undefined as Date | undefined })),
    ...dynamicRoutes,
  ]

  return locales.flatMap((locale) =>
    allRoutes.map((route) => ({
      url: absoluteUrl(locale, route.path),
      lastModified: route.lastModified ?? new Date(),
      changeFrequency: route.changeFreq,
      priority: route.priority,
      alternates: {
        languages: {
          en: absoluteUrl('en', route.path),
          zh: absoluteUrl('zh', route.path),
        },
      },
    }))
  )
}
