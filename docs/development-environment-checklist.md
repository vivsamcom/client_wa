# WhatsApp Business Platform Lab Environment and Development Checklist

## Recommended lab model

Use a multi-tenant lab with one internal Meta Business portfolio/app for engineering experiments and one separate Meta app per client or client group when moving toward UAT/production. Keep each client backend repo separate, but start from this common reference template.

Recommended environments:

1. Local developer machine: Docker Desktop, Node.js 20+, Git, VS Code, ngrok/cloudflared.
2. Shared Dev lab: containerized API + worker, managed PostgreSQL/RabbitMQ/MongoDB, HTTPS URL, test phone number.
3. QA/UAT: client-specific Meta app/webhook, client-like database, observability, backups, masked test data.
4. Production: client-owned or client-approved Meta Business setup, system-user token, production WABA/phone number, verified templates, strong monitoring and incident process.

## Target architecture

Meta WhatsApp Cloud API -> HTTPS webhook -> Node.js webhook API -> RabbitMQ -> worker -> database -> WhatsApp Graph API outbound replies.

The webhook must acknowledge Meta quickly. Business processing should happen asynchronously in the worker.

## Meta Developer Portal setup

- Create or use Meta developer account.
- Create app with WhatsApp product.
- Configure phone number ID and access token.
- Configure webhook callback URL and verify token.
- Subscribe to messages webhook fields.
- Store app secret and validate x-hub-signature-256 in production.
- Create message templates for production-initiated conversations.
- For client production, prefer client-owned WABA onboarding/Embedded Signup or clear partner operational ownership.

## Local machine requirements

- Windows 10/11 or macOS.
- Docker Desktop installed and running.
- Git installed.
- Node.js 20 LTS or above.
- VS Code.
- Postman/curl for testing.
- ngrok or Cloudflare Tunnel for temporary HTTPS callback.

## Windows Docker setup

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

## macOS Docker setup

1. Install Docker Desktop for Apple Silicon or Intel.
2. Start Docker Desktop.
3. Validate:

```bash
docker --version
docker compose version
docker run hello-world
```

## Local run checklist

```bash
git clone <repo-url>
cd client_wa_loan_demo
cp .env.example .env
# edit .env
docker compose up --build
```

Then open:

- API health: http://localhost:3000/health
- RabbitMQ management: http://localhost:15672

## ngrok setup

```bash
ngrok http 3000
```

Use the generated HTTPS forwarding URL as the Meta callback URL:

```text
https://<ngrok-id>.ngrok-free.app/webhook
```

## Environment variables guidance

Keep environment-specific values in environment variables. Do not hardcode secrets in Dockerfile, docker-compose committed files, or code.

- Local: `.env` file, not committed.
- Docker Compose: `env_file: .env` for local only.
- Render/AWS/Azure: platform secret manager or dashboard environment variables.
- Dockerfile: only non-secret build/runtime defaults.

## Client repo strategy

Create a base template repo and duplicate/fork per client only when needed. Keep reusable framework pieces in a shared internal package later:

- webhook verification and signature validation
- queue publisher/consumer
- WhatsApp outbound service
- common database repository contract
- observability middleware
- health checks

## PostgreSQL/MongoDB wrapper strategy

Do not try to write raw SQL and Mongo queries in the same place. Use a repository interface such as `saveIncomingMessage`, `setLanguage`, `createLoanLead`. Each adapter implements the same business operations for the selected database.

## Production hardening checklist

- Enable webhook signature validation.
- Use system-user token or secure token lifecycle.
- Use HTTPS only.
- Add retries/dead-letter queues.
- Make message processing idempotent using WhatsApp message ID.
- Add structured logs and correlation IDs.
- Add metrics and alerts.
- Encrypt secrets and database backups.
- Apply data retention rules for finance/hospital data.
- Separate client data and credentials.
- Use managed database and queue for production.
- Add CI/CD with image scanning.
