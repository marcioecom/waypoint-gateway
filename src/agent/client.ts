import { env } from "../config.ts";

const AGENT_TIMEOUT_MS = 180_000;

function messagesUrl(): string {
  return `${env.AGENT_URL.replace(/\/$/, "")}/v1/messages`;
}

export async function forwardMessage(
  jid: string,
  text: string,
): Promise<string | null> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (env.GATEWAY_TOKEN) {
    headers.authorization = `Bearer ${env.GATEWAY_TOKEN}`;
  }

  const response = await fetch(messagesUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({ message: text, thread_id: jid }),
    signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`agent ${response.status}: ${detail}`);
  }

  // 202: o agent manda a resposta de volta em POST /messages.
  // 200 com { messages }: este gateway envia, para o caso de GATEWAY_URL
  // não estar configurado no agent.
  const data: unknown = await response.json().catch(() => null);
  if (!data || typeof data !== "object" || !("messages" in data)) return null;
  const messages = (data as { messages: unknown }).messages;
  if (typeof messages !== "string" || !messages.trim()) return null;
  return messages;
}
