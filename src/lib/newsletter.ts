/**
 * Resend Audience 联系人同步（订阅/退订双向）。
 *
 * - 未配置 RESEND_API_KEY / RESEND_AUDIENCE_ID 时视为无需同步，返回 true。
 * - Resend SDK 的 API 错误通过返回值的 error 字段表达而非抛异常，
 *   必须显式检查；网络异常与 API 错误统一返回 false 并记录日志。
 * - 本地表是事实来源，调用方不因同步失败而失败；
 *   订阅与退订入口均可重复触发本函数，作为失败后的重试路径。
 */
export async function syncResendContact(
  email: string,
  unsubscribed: boolean
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return true;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    if (!unsubscribed) {
      // 仅用于确保联系人存在，"已存在"类报错可忽略，以下方 update 结果为准
      await resend.contacts
        .create({ email, audienceId, unsubscribed: false })
        .catch(() => undefined);
    }

    const { error } = await resend.contacts.update({
      email,
      audienceId,
      unsubscribed,
    });

    if (error) {
      console.error(
        `Resend contact sync failed (${unsubscribed ? "unsubscribe" : "subscribe"}, email=${email}):`,
        error
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      `Resend contact sync threw (${unsubscribed ? "unsubscribe" : "subscribe"}, email=${email}):`,
      error
    );
    return false;
  }
}
