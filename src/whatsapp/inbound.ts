import type { WAMessage, WASocket } from "@whiskeysockets/baileys";
import { forwardMessage } from "../agent/client.ts";
import { logger } from "../logger.ts";
import { isDirectChat, remember, textOf } from "./text.ts";

const FALLBACK =
  "Não consegui processar sua mensagem agora. Tenta de novo daqui a pouco.";

async function deliver(
  sock: WASocket,
  jid: string,
  text: string,
): Promise<void> {
  await sock.sendMessage(jid, { text });
  await sock.sendPresenceUpdate("paused", jid).catch(() => {});
}

export async function handleIncoming(
  sock: WASocket,
  message: WAMessage,
): Promise<void> {
  if (message.key.fromMe) return;
  const jid = message.key.remoteJid;
  if (!jid || !isDirectChat(jid)) return;
  if (message.key.id && !remember(message.key.id)) return;

  const text = textOf(message)?.trim();
  if (!text) return;

  logger.info({ jid }, `inbound ${jid}: ${text.slice(0, 80)}`);
  await sock.sendPresenceUpdate("composing", jid).catch(() => {});
  await sock.readMessages([message.key]).catch(() => {});

  try {
    const reply = await forwardMessage(jid, text);
    if (reply) await deliver(sock, jid, reply);
  } catch (error) {
    logger.error({ err: error, jid }, "agent call failed");
    await deliver(sock, jid, FALLBACK).catch(() => {});
  }
}
