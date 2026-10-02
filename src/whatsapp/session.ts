import type { WASocket } from "@whiskeysockets/baileys";

export type WhatsAppStatus = "connecting" | "open" | "close";

let socket: WASocket | null = null;
let status: WhatsAppStatus = "connecting";

export function getSocket(): WASocket | null {
  return socket;
}

export function setSocket(next: WASocket | null): void {
  socket = next;
}

export function getStatus(): WhatsAppStatus {
  return status;
}

export function setStatus(next: WhatsAppStatus): void {
  status = next;
}
