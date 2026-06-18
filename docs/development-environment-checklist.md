# WhatsApp Business Platform Lab Environment and Development Checklist

## Recommended Lab Model

Use a multi-tenant lab with one internal Meta Business portfolio/app for engineering experiments and one separate Meta app per client or client group when moving toward UAT/production. Keep each client backend repo separate, but start from this common reference template.

Recommended environments:

1. Local developer machine: Docker Desktop, Node.js 24+, Git, VS Code, ngrok/cloudflared.
2. Shared dev/demo lab: Render Node.js API and worker, Neon PostgreSQL, Upstash Redis, HTTPS URL, test phone number.
3. QA/UAT: client-specific Meta app/webhook, client-like database, observability, backups, masked test data.
4. Production: client-owned or client-approved Meta Business setup, system-user token, production WABA/phone number, verified templates, strong monitoring and incident process.

## Target Architecture

Meta WhatsApp Cloud API -> HTTPS webhook -> Node.js Express API -> BullMQ -> Redis -> Node.js worker -> database -> WhatsApp Graph API outbound replies.

The webhook must acknowledge Meta quickly. Business processing should happen asynchronously in the worker.

## Standard Stack

| Component | Local | Cloud / Demo |
| --- | --- | --- |
| Node.js | Node.js 24 Docker container | Render Docker service |
| HTTP framework | Express | Express |
| Primary database | PostgreSQL container | Neon PostgreSQL |
| Queue framework | BullMQ | BullMQ |
| Queue backend | Redis container | Upstash Redis |
| Optional document database | MongoDB container profile | MongoDB Atlas |
| HTTPS | ngrok/cloudflared | Render HTTPS |

## Meta Developer Portal Setup

- Create or use Meta developer account.
- Create app with WhatsApp product.
- Configure phone number ID and access token.
- Configure webhook callback URL and verify token.
- Subscribe to messages webhook fields.
- Store app secret and validate `x-hub-signature-256` in production.
- Create message templates for production-initiated conversations.
- For client production, prefer client-owned WABA onboarding/Embedded Signup or clear partner operational ownership.

## Local Machine Requirements

- Windows 10/11 or macOS.
- Docker Desktop installed and running.
- Git installed.
- Node.js 24 LTS or above for non-container local commands.
- VS Code.
- Postman/curl for testing.
- ngrok or Cloudflare Tunnel for temporary HTTPS callback.

## Windows Docker Setup

1. Enable virtualization in BIOS if disabled.
2. Install WSL2 and Docker Desktop.
3. Restart machine.
4. Open Docker Desktop and choose Linux containers.
5. Validate:

```bash
docker --version
docker compose version
docker run hello-world
```

## macOS Docker Setup

1. Install Docker Desktop for Apple Silicon or Intel.
2. Start Docker Desktop.
3. Validate:

```bash
docker --version
docker compose version
docker run hello-world
```

## Local Run Checklist

```bash
git clone <repo-url>
cd client_wa
cp .env.example .env
# edit .env
docker compose up --build
```

Then open:

- API health: http://localhost:3000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

MongoDB is optional for local experiments:

```bash
docker compose --profile mongo up --build
```

## Cloud / Demo Checklist

Use managed services instead of running stateful containers in cloud/demo:

- Render: Node.js API Docker service.
- Render: Node.js background worker using `node src/worker.js`.
- Neon: PostgreSQL connection string in `DATABASE_URL`.
- Upstash Redis: Redis protocol URL in `QUEUE_URL`.
- MongoDB Atlas: optional `MONGODB_URI` only when `DB_PROVIDER=mongo`.

Run the Postgres migration once from a Render shell/job after setting `DATABASE_URL`:

```bash
npm run db:migrate
```

## ngrok Setup

```bash
ngrok http 3000
```

Use the generated HTTPS forwarding URL as the Meta callback URL:

```text
https://<ngrok-id>.ngrok-free.app/webhook
```

## Environment Variables Guidance

Keep environment-specific values in environment variables. Do not hardcode secrets in Dockerfile, docker-compose committed files, or code.

- Local: `.env` file, not committed.
- Docker Compose: `env_file: .env` for local only.
- Render: dashboard environment variables or secret manager.
- Neon: use the pooled or direct PostgreSQL URL as appropriate for the runtime.
- Upstash: use the Redis protocol URL, usually `rediss://...`, for BullMQ.
- Dockerfile: only non-secret build/runtime defaults.

## Client Repo Strategy

Create a base template repo and duplicate/fork per client only when needed. Keep reusable framework pieces in a shared internal package later:

- webhook verification and signature validation
- BullMQ queue publisher/consumer
- WhatsApp outbound service
- common database repository contract
- observability middleware
- health checks

## PostgreSQL/MongoDB Wrapper Strategy

Do not try to write raw SQL and Mongo queries in the same place. Use a repository interface such as `saveIncomingMessage`, `setLanguage`, `createLoanLead`. Each adapter implements the same business operations for the selected database.

## Production Hardening Checklist

- Enable webhook signature validation.
- Use system-user token or secure token lifecycle.
- Use HTTPS only.
- Add retries, dead-letter handling and queue dashboards.
- Make message processing idempotent using WhatsApp message ID.
- Add structured logs and correlation IDs.
- Add metrics and alerts.
- Encrypt secrets and database backups.
- Apply data retention rules for finance/health data.
- Separate client data and credentials.
- Use managed database and queue services for cloud/demo/production.
- Add CI/CD with image scanning.
