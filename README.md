# Client WhatsApp Loan Demo

Node.js 24 + Express reference backend for WhatsApp Business Platform loan/lending demos.

## Standard Stack

| Component | Local | Cloud / Demo |
| --- | --- | --- |
| Node.js API and worker | Docker Compose | Render |
| HTTP framework | Express | Express |
| Primary database | PostgreSQL container | Neon PostgreSQL |
| Queue framework | BullMQ | BullMQ |
| Queue backend | Redis container | Upstash Redis |
| Optional document database | MongoDB container profile | MongoDB Atlas |
| Local HTTPS tunnel | ngrok | Render HTTPS |

## What this demo does

- Verifies Meta webhook requests using `VERIFY_TOKEN`.
- Receives WhatsApp webhook events and queues them with BullMQ.
- Processes queued jobs in a Node.js worker.
- Stores customers, inbound messages, language preference and loan leads.
- Uses PostgreSQL by default, with optional MongoDB repository support.
- Sends WhatsApp interactive language buttons and a basic loan menu.

## Local Setup

Local development runs the app, PostgreSQL, Redis and the migration job with Docker Compose.

```bash
cp .env.example .env
# Update VERIFY_TOKEN, WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env

docker compose up --build
```

Open:

- API health: http://localhost:3000/health
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

MongoDB is optional:

```bash
docker compose --profile mongo up --build
```

PostgreSQL remains the default persistence provider. To use MongoDB, set `DB_PROVIDER=mongo` and `MONGODB_URI=mongodb://mongo:27017`.

## Meta Webhook Callback URL

For local testing, expose your local API:

```bash
ngrok http 3000
```

Use the HTTPS forwarding URL in Meta Developer Portal:

```text
https://<ngrok-subdomain>.ngrok-free.app/webhook
```

Set the same verify token in Meta and in `.env`.

## PostgreSQL Migration

Local Compose runs the PostgreSQL migration once before starting the API and worker. Manual local run:

```bash
npm run db:migrate
```

For cloud/demo environments, run the migration against Neon from a Render shell/job after setting `DATABASE_URL`:

```bash
npm run db:migrate
```

## Cloud Development / Demo / POC

Run only Node.js containers in cloud/demo environments. Use managed services for stateful infrastructure:

- Node.js API and worker: Render
- PostgreSQL: Neon
- Queue backend: Upstash Redis
- Optional MongoDB: MongoDB Atlas

Use `.env.cloud.example` as the reference for platform environment variables:

```env
DATABASE_URL=postgresql://...neon...?sslmode=require
QUEUE_URL=rediss://default:...@...upstash.io:...
DB_PROVIDER=postgres
```

The application also accepts `REDIS_URL` as a fallback for `QUEUE_URL`.

## Render Deployment

1. Push this repo to GitHub.
2. Create a Render Web Service from the repo.
3. Runtime: Docker, using `./Dockerfile`.
4. Set environment variables in Render dashboard, not inside Dockerfile.
5. Health check path: `/health`.
6. Create a separate Render Background Worker using the same repo and Docker image with start command:

```bash
node src/worker.js
```

7. Run the PostgreSQL migration once against Neon.

Render should run only the Node.js API and worker containers. PostgreSQL, Redis and MongoDB should stay managed outside the Render container.
