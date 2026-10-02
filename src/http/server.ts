import { env } from "../config.ts";
import { logger } from "../logger.ts";
import { requireToken } from "./middleware/auth.ts";
import { health } from "./routes/health.ts";
import { sendMessage } from "./routes/messages.ts";

export function startServer(): void {
  Bun.serve({
    port: env.PORT,
    hostname: "0.0.0.0",
    routes: {
      "/health": health,
      "/messages": {
        POST: requireToken(sendMessage),
      },
    },
  });

  logger.info(`gateway listening on ${env.PORT}`);
}
