export const SITE_NAME = "TakeShots";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://takeshots.com").replace(/\/$/, "");
}

/** Escape user-controlled text for Telegram's HTML parse mode. */
export function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sends an HTML-formatted message, prefixed with the site name so notifications
 * from multiple sites in one chat are distinguishable. Callers must pass any
 * visitor-supplied text through `esc()`.
 */
export async function notifyTelegram(html: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const host = siteUrl().replace(/^https?:\/\//, "");
  const text = `🥃 <b>${SITE_NAME}</b> · <a href="${siteUrl()}">${esc(host)}</a>\n\n${html}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4096),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error("Telegram notify failed:", res.status, await res.text());
  } catch (err) {
    console.error("Telegram notify failed:", err);
  }
}
