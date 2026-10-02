import { timingSafeEqual } from "node:crypto";
import { env } from "../../config.ts";
import type { RouteHandler } from "../types.ts";

function tokensMatch(received: string, expected: string): boolean {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function requireToken(handler: RouteHandler): RouteHandler {
  return async (req) => {
    if (!env.GATEWAY_TOKEN) return handler(req);

    const header = req.headers.get("authorization") ?? "";
    const received = header.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : "";
    if (!tokensMatch(received, env.GATEWAY_TOKEN)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    return handler(req);
  };
}
