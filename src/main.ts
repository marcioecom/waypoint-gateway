import { startServer } from "./http/server.ts";
import { connectToWhatsApp } from "./whatsapp/connection.ts";

startServer();
connectToWhatsApp();
