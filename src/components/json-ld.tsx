
interface WebSiteJsonLdProps {
  name: string
  description: string
  url: string
  locale: string
}

/**
 * WebSite structured data for the homepage
 * Helps search engines understand the site is an AI tools directory
 */
export function WebSiteJsonLd({ name, description, url, locale }: WebSiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/tools?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface OrganizationJsonLdProps {
  name: string
  url: string
  logo: string
  sameAs?: string[]
}

/**
 * Organization structured data
 */
export function OrganizationJsonLd({ name, url, logo, sameAs = [] }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface SoftwareApplicationJsonLdProps {
  name: string
  description: string
  url: string
  image?: string
  category?: string
  applicationCategory?: string
}

/**
 * SoftwareApplication structured data for individual AI tools
 * Use this on tool detail pages
 */
export function SoftwareApplicationJsonLd({
  name,
  description,
  url,
  image,
  category,
  applicationCategory = 'AI Tool',
}: SoftwareApplicationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    ...(image && { image }),
    ...(category && { category }),
    applicationCategory,
    operatingSystem: 'Web',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface CollectionPageJsonLdProps {
  name: string
  description: string
  url: string
  itemCount?: number
}

/**
 * CollectionPage structured data for the tools listing page
 */
export function CollectionPageJsonLd({
  name,
  description,
  url,
  itemCount,
}: CollectionPageJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    ...(itemCount && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: itemCount,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
