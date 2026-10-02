# waypoint-baileys

Gateway de WhatsApp. Conecta um número via Baileys, encaminha cada conversa direta para o agent e envia de volta o que o agent pedir.

1. Alguém manda mensagem no WhatsApp.
2. Este serviço faz `POST {AGENT_URL}/v1/messages` com `{ message, thread_id }`. O `thread_id` é o JID do chat.
3. O agent responde com `POST {GATEWAY_URL}/messages` e `{ jid, text }`.
4. O gateway entrega o texto no WhatsApp.

Os dois serviços usam o mesmo `GATEWAY_TOKEN` no header `Authorization: Bearer ...`.

Grupos e status são ignorados. Se o agent não tiver `GATEWAY_URL`, ele responde `{ messages }` no próprio POST e o gateway envia esse texto.

```bash
bun install
bun run dev
```

`main.ts` só sobe o processo. O resto fica em `src/`: `config.ts` valida as envs, `http/` são as rotas e o middleware de token, `whatsapp/` é a sessão Baileys e `agent/` chama o agent.

O QR sai no log na primeira conexão. A sessão fica em `AUTH_DIR` (padrão `auth_info_baileys`).

| Variável | Onde | Exemplo |
| --- | --- | --- |
| `AGENT_URL` | gateway | `http://localhost:8000` |
| `GATEWAY_URL` | agent | `http://localhost:3000` |
| `GATEWAY_TOKEN` | os dois | um segredo igual |
| `PORT` | gateway | `3000` (Railway define) |
| `AUTH_DIR` | gateway | `auth_info_baileys` |

No Railway, são dois services. Use a rede privada (`http://<service>.railway.internal:<porta>`) para `AGENT_URL` e `GATEWAY_URL`. No gateway, monte um volume e aponte `AUTH_DIR` para ele — sem isso o QR volta a cada deploy. Healthcheck: `GET /health`.
