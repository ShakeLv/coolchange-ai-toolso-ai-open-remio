import { Metadata } from 'next'
import { defaultLocale } from '@/i18n.config'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * 构建与 localePrefix: 'as-needed' 一致的绝对 URL：
 * 默认语言 (en) 不带前缀，其他语言带 /{locale} 前缀。
 * canonical / hreflang / sitemap 必须统一走这里，避免指向 301 重定向。
 */
export function absoluteUrl(locale: string, path: string): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  return `${baseUrl}${prefix}${path}` || baseUrl
}

export function languageAlternates(path: string) {
  return {
    'en-US': absoluteUrl('en', path),
    'zh-CN': absoluteUrl('zh', path),
    'x-default': absoluteUrl(defaultLocale, path),
  }
}

interface GenerateMetadataProps {
  locale: string
  path: string
  title: string
  description: string
  ogImage?: string
  ogType?: 'website' | 'article'
}

export function generatePageMetadata({
  locale,
  path,
  title,
  description,
  ogImage = `${baseUrl}/og-image.png`,
  ogType = 'website',
}: GenerateMetadataProps): Metadata {
  const canonicalUrl = absoluteUrl(locale, path)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Toolso.AI',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
