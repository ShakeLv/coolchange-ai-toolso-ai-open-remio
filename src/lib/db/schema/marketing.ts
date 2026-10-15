import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

// ========== Newsletter 订阅表 ==========
export const newsletterSubscription = pgTable("newsletter_subscription", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  // 已登录用户订阅时关联，游客订阅为空
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  // 状态: active | unsubscribed
  status: text("status").notNull().default("active"),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("newsletter_subscription_status_idx").on(table.status),
]);

// ========== 联系表单留言表 ==========
export const contactMessage = pgTable("contact_message", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
