import { getStatus } from "../../whatsapp/session.ts";

export function health(): Response {
  return Response.json({ ok: true, whatsapp: getStatus() });
}
