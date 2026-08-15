# ICA proxy

A tiny (zero-dependency) Node server that stands between the dashboard and the
ICA Developer API. It exists because the ICA API key must stay server-side and
the browser can't call ICA directly (CORS). See `ICA-NOTES.md` §1 and §6.

## Setup

1. Copy the env template and fill it in:

   ```bash
   cd proxy
   cp .env.example .env
   # edit .env: set ICA_API_KEY, ICA_NAMESPACE, ICA_MODEL_ID
   ```

2. Start it (needs Node 18+ for built-in `fetch`):

   ```bash
   npm start        # from the proxy/ folder
   # -> [ica-proxy] listening on http://localhost:3001
   ```

3. Turn the integration on in the React app. In the **project root** `.env`:

   ```bash
   REACT_APP_ICA_ENABLED=true
   REACT_APP_ICA_PROXY_URL=http://localhost:3001   # optional; this is the default
   ```

   Then restart `npm start` (CRA reads env vars only at startup). While
   `REACT_APP_ICA_ENABLED` is unset/false the app makes no network calls and the
   AI cards show their built-in copy — so there's no console noise before setup.

## Routes

| Route | Purpose |
|---|---|
| `GET /api/health` | Reports whether the key/model are configured. Safe without a key. |
| `GET /api/list?ns=agents` | Lists assistants/agents/models in a namespace — use it to find your agent id. |
| `POST /api/chat` | Forwards `{ messages, max_tokens }` to `/{namespace}/chat/completions`. |

## Finding your agent id

After creating your agent in ICA and setting `ICA_API_KEY`:

```bash
curl "http://localhost:3001/api/list?ns=agents"
```

Copy the `id` of your agent into `ICA_MODEL_ID` in `.env`, then restart.

## Notes

- Only `max_tokens` is honored by ICA (Bedrock route). The proxy deliberately
  does **not** forward `temperature` / `top_p` / `reasoning_effort` — they 400.
- The dashboard degrades gracefully: if this proxy isn't running or the key
  isn't set, the AI Summary and Career Nudge fall back to their built-in copy.
