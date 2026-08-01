import fs from "node:fs";
import path from "node:path";

import rehypePrism from "@mapbox/rehype-prism";
import nextMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

const pnpmManagedPath = path.join(process.cwd(), "node_modules", ".pnpm");
const snapshotManagedPaths = fs.existsSync(pnpmManagedPath) ? [pnpmManagedPath] : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署使用 standalone 输出
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "a.offerget.pro",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Google favicon 服务（种子数据 logo 来源之一）
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      // R2/S3 公共访问域名（上传的 logo/封面）
      ...(process.env.STORAGE_PUBLIC_URL
        ? [
            {
              protocol: "https",
              hostname: new URL(process.env.STORAGE_PUBLIC_URL).hostname,
            },
          ]
        : []),
      // 工具 logo 指向各工具官网的 favicon，域名不可枚举，放开 https 通配
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: {
    rules: {
      '*.mdx': {
        loaders: ['@mdx-js/loader'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.snapshot ??= {};
    config.snapshot.managedPaths = snapshotManagedPaths;
    return config;
  },
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

export default withNextIntl(withMDX(nextConfig));
