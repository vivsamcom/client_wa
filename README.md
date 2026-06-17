# Client WhatsApp Loan Demo

Node.js reference backend for WhatsApp Business Platform loan/lending demos.

## What this demo does

- Verifies Meta webhook using `VERIFY_TOKEN`.
- Receives WhatsApp webhook events and immediately pushes them to RabbitMQ.
- Worker consumes the queue and processes messages.
- Stores customers, inbound messages, language preference and loan leads.
- Supports PostgreSQL or MongoDB via a repository wrapper.
- Sends WhatsApp interactive language buttons and a basic loan menu.
- Runs locally using Docker Compose and can be deployed as a Docker web service.

## Local setup

Default local setup uses PostgreSQL:

```bash
cp .env.example .env
# Update VERIFY_TOKEN, WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env

docker compose --profile postgres up --build
```

Open:

- API health: http://localhost:3000/health
- RabbitMQ console: http://localhost:15672, user `guest`, password `guest`

## Meta webhook callback URL

For local testing, expose your local API:

```bash
ngrok http 3000
```

Use the HTTPS forwarding URL in Meta Developer Portal:

```text
https://<ngrok-subdomain>.ngrok-free.app/webhook
```

Set the same verify token in Meta and in `.env`.

## PostgreSQL migration

The default Compose stack runs PostgreSQL migration once in the `postgres-migrate` service before starting the API and worker. Manual run:

```bash
npm run db:migrate
```

## Switching DB provider

PostgreSQL profile:

```bash
docker compose --profile postgres up --build
```

MongoDB profile:

```bash
docker compose --profile mongo up --build
```

The selected Compose profile sets the local `DB_PROVIDER` and container database URL automatically. Keep external/production database settings in environment variables outside Compose.

MongoDB mode does not run the PostgreSQL migration or start PostgreSQL. PostgreSQL mode starts `postgres-migrate` once before the API and worker.

Application code calls `conversation.repository.js`; individual adapters hide PostgreSQL/MongoDB differences.

## Render Docker deployment

1. Push this repo to GitHub.
2. Create a Render Web Service from the repo.
3. Runtime: Docker.
4. Set environment variables in Render dashboard, not inside Dockerfile.
5. Health check path: `/health`.
6. Create a separate Render Background Worker using the same repo and Docker image with start command:

```bash
node src/worker.js
```

Use managed PostgreSQL/RabbitMQ/MongoDB add-ons or external providers in production instead of Docker Compose stateful containers.
