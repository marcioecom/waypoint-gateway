import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { env } from "../config.ts";
import { logger } from "../logger.ts";
import { handleIncoming } from "./inbound.ts";
import { setSocket, setStatus } from "./session.ts";

let connecting = false;

export async function connectToWhatsApp(): Promise<void> {
  if (connecting) return;
  connecting = true;
  setStatus("connecting");

  try {
    const { state, saveCreds } = await useMultiFileAuthState(env.AUTH_DIR);
    let version: Awaited<
      ReturnType<typeof fetchLatestBaileysVersion>
    >["version"] | undefined;
    try {
      version = (await fetchLatestBaileysVersion()).version;
    } catch (error) {
      logger.warn({ err: error }, "could not fetch latest baileys version");
    }

    const sock = makeWASocket({
      auth: state,
      logger: logger.child({ name: "baileys" }, { level: "warn" }),
      markOnlineOnConnect: false,
      ...(version ? { version } : {}),
    });
    setSocket(sock);

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) qrcode.generate(qr, { small: true });
      if (connection === "open") {
        setStatus("open");
        logger.info("opened connection");
        return;
      }
      if (connection !== "close") return;

      const loggedOut =
        (lastDisconnect?.error as Boom | undefined)?.output?.statusCode ===
        DisconnectReason.loggedOut;
      setSocket(null);
      setStatus("close");
      connecting = false;
      logger.warn(
        { err: lastDisconnect?.error, reconnecting: !loggedOut },
        "connection closed",
      );
      if (loggedOut) {
        logger.warn(
          `logged out; delete ${env.AUTH_DIR} and restart to pair again`,
        );
        return;
      }
      connectToWhatsApp();
    });

    sock.ev.on("messages.upsert", async (event) => {
      if (event.type !== "notify") return;
      for (const message of event.messages) {
        await handleIncoming(sock, message);
      }
    });
  } catch (error) {
    connecting = false;
    setStatus("close");
    setSocket(null);
    logger.error({ err: error }, "whatsapp connect failed");
    setTimeout(connectToWhatsApp, 2_000);
  }
}
