"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/button";
import { Container } from "@/components/container";
import { Background } from "@/components/background";
import { motion } from "framer-motion";
import { FavoriteToolsSection } from "@/features/tools/components/favorite-tools-section";

export default function DashboardPage() {
  const router = useRouter();
  const session = useSession();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  // Authentication is already handled in the layout
  const user = session.data?.user;

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <Container className="relative z-10 py-20">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <Container className="relative z-10 py-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            {t("welcome")}, {user?.name || user?.email}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Personal Info Card */}
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              {t("cards.personalInfo.title")}
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  {t("cards.personalInfo.labels.name")}
                </span>
                <span className="text-base font-medium text-card-foreground">
                  {user?.name || t("cards.personalInfo.labels.notSet")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  {t("cards.personalInfo.labels.email")}
                </span>
                <span className="text-base font-medium text-card-foreground">
                  {user?.email}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  {t("cards.personalInfo.labels.status")}
                </span>
                <span className="text-base font-medium text-green-500">
                  {tCommon("status.verified")}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              {t("cards.quickActions.title")}
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start transition-colors"
                onClick={() => router.push(`/${locale}/profile`)}
              >
                {t("cards.quickActions.editProfile")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start transition-colors"
              >
                {t("cards.quickActions.accountSettings")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start transition-colors"
              >
                {t("cards.quickActions.securitySettings")}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Button
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
            variant="simple"
            className="px-8"
          >
            Sign Out
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <FavoriteToolsSection />
        </motion.div>
      </Container>
    </div>
  );
}
