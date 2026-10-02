import { z } from "zod";
import { getSocket, getStatus } from "../../whatsapp/session.ts";

const outboundSchema = z.object({
  jid: z.string().min(1),
  text: z.string().trim().min(1),
});

export async function sendMessage(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = outboundSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "jid and text are required" },
      { status: 400 },
    );
  }

  const sock = getSocket();
  if (!sock || getStatus() !== "open") {
    return Response.json({ error: "whatsapp not connected" }, { status: 503 });
  }

  const { jid, text } = parsed.data;
  await sock.sendMessage(jid, { text });
  await sock.sendPresenceUpdate("paused", jid).catch(() => {});
  return Response.json({ ok: true });
}
