"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { contactMessage } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { contactSchema, type ContactInput } from "@/features/marketing/schemas";

export async function submitContactMessage(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "INVALID_INPUT" };
  }

  const { name, email, company, message } = parsed.data;

  try {
    await db.insert(contactMessage).values({
      id: nanoid(),
      name,
      email,
      company,
      message,
    });
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return { success: false as const, error: "SAVE_FAILED" };
  }

  // 邮件通知站点管理员；发信失败不影响留言已落库的结果
  const receiver = process.env.CONTACT_RECEIVER_EMAIL;
  if (receiver) {
    await sendEmail({
      to: receiver,
      subject: `New contact message from ${name} - Toolso.AI`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 6px;">${escapeHtml(message)}</p>
        </div>
      `,
    });
  }

  return { success: true as const };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
