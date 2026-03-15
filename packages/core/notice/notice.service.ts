import { getNoticeById, updateNotice } from "@ddd/db";
import { ERRORS, AppError } from "../errors";

export async function publishNotice(noticeId: string) {
  const n = await getNoticeById(noticeId);
  if (!n) throw new AppError(ERRORS.NOTICE_NOT_FOUND);
  if (n.isPublished) throw new AppError(ERRORS.ALREADY_PUBLISHED);

  const updated = await updateNotice(noticeId, {
    isPublished: true,
    publishedAt: new Date(),
  });

  // Discord Webhook 전송 (DISCORD_NOTICE_WEBHOOK_URL 환경변수 필요)
  const webhookUrl = process.env.DISCORD_NOTICE_WEBHOOK_URL;
  if (webhookUrl && n.target === "ALL") {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**${n.title}**\n${n.content}`,
      }),
    });
  }

  return updated;
}
