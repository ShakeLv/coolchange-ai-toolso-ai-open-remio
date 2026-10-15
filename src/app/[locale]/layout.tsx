import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n.config";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "sonner";
import Analytics from "@/analytics/analytics";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <ViewTransitions>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={cn(
            GeistSans.className,
            "bg-background text-foreground antialiased min-h-screen w-full"
          )}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            enableSystem
            disableTransitionOnChange
            defaultTheme="light"
          >
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
              <Toaster position="top-right" richColors />
              <Analytics />
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
