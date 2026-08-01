"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { subscribeNewsletter } from "@/features/marketing/actions/newsletter-actions";

export function NewsletterForm() {
  const t = useTranslations("footer.newsletter");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || pending) return;
    setPending(true);
    try {
      const result = await subscribeNewsletter(email);
      if (result.success) {
        toast.success(t("success"));
        setEmail("");
      } else {
        toast.error(
          result.error === "INVALID_EMAIL" ? t("invalidEmail") : t("error")
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 max-w-sm">
      <h4 className="text-sm font-semibold text-foreground">{t("title")}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{t("description")}</p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          {t("subscribe")}
        </button>
      </form>
    </div>
  );
}
