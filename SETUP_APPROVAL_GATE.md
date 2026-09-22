# Telegram Approval Gate Setup

## 1) Environment variables
Configure the variables in `.env.local` (see `.env.example`):

- `DATABASE_URL`: Postgres connection string.
- `TELEGRAM_BOT_TOKEN`: Telegram bot token.
- `TELEGRAM_CHAT_ID` (or `TELEGRAM_CHAT_IDS`): target chat IDs for approval prompts.
- `TELEGRAM_WEBHOOK_SECRET`: optional secret token validated on webhook requests.
- `APP_BASE_URL`: public app base URL used by webhook registration endpoint.
- `APPROVAL_TTL_SEC`: optional token TTL in seconds (default 600).
- `APPROVAL_REDIRECT_ALLOWLIST`: optional comma-separated redirect host allowlist.

## 2) Run migration
Apply `migrations/001_create_approval_state.sql` to your Postgres database.

## 3) Register webhook
Register Telegram webhook to `/api/telegram/webhook`:

```bash
curl -X POST "${APP_BASE_URL}/api/telegram/set-webhook" \
  -H "Content-Type: application/json" \
  -d '{"baseUrl":"'"${APP_BASE_URL}"'"}'
```

The endpoint calls Telegram `setWebhook` server-side and supports `TELEGRAM_WEBHOOK_SECRET`.

## 4) Flow summary
- `/api/telegram/login` creates a pending `approval_state` row and sends an inline keyboard with callback data:
  - `approve:<token>`
  - `decline:<token>`
  - `redirect:<token>`
- Telegram posts callback updates to `/api/telegram/webhook`.
- Client polls `/api/approval?token=<token>` until terminal status.
