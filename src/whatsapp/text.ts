import {
  extractMessageContent,
  getContentType,
  type WAMessage,
} from "@whiskeysockets/baileys";

const seen = new Set<string>();

export function isDirectChat(jid: string): boolean {
  return jid.endsWith("@s.whatsapp.net") || jid.endsWith("@lid");
}

export function remember(id: string): boolean {
  if (seen.has(id)) return false;
  seen.add(id);
  if (seen.size > 1000) {
    const oldest = seen.values().next().value;
    if (oldest) seen.delete(oldest);
  }
  return true;
}

export function textOf(message: WAMessage): string | undefined {
  const content = extractMessageContent(message.message);
  if (!content) return;
  const kind = getContentType(content);
  if (kind === "conversation") return content.conversation || undefined;
  if (kind === "extendedTextMessage") {
    return content.extendedTextMessage?.text || undefined;
  }
  if (kind === "imageMessage") return content.imageMessage?.caption || undefined;
  if (kind === "videoMessage") return content.videoMessage?.caption || undefined;
  if (kind === "documentMessage") {
    return content.documentMessage?.caption || undefined;
  }
  return;
}
