# Client WhatsApp Loan Flow

Node.js + Express WhatsApp Business Platform webhook for a client-specific loan flow.

The reusable platform code lives under `src/platform`. The current client flow lives under `src/business-flow`. For another client, copy this repo and replace only `src/business-flow` with the new travel, hospital, insurance, or other flow.

## Runtime Shape

- Webhook app verifies Meta webhook requests.
- Webhook POST receives Meta payloads, publishes them to the incoming queue, and returns `200` immediately.
- Worker consumes queue messages, extracts WhatsApp message context, and calls:

```js
const businessFlow = require('./business-flow');
await businessFlow.handleIncomingMessage(messageContext);
```

There is no `BUSINESS_FLOW` environment selection in this repo. It uses the loan flow only.

## Local Docker Setup

Copy the local env template:

```bash
cp .env.example .env
```

Set your Meta values in `.env`:

```env
META_VERIFY_TOKEN=
META_ACCESS_TOKEN=
META_PHONE_NUMBER_ID=
META_API_VERSION=v23.0
```

Start the local stack:

```bash
docker compose up --build
```

Services:

- App: http://localhost:3000
- Health: http://localhost:3000/health
- PostgreSQL: `localhost:5432`
- LavinMQ AMQP: `localhost:5672`
- LavinMQ UI: http://localhost:15672

Run the PostgreSQL migration once:

```bash
docker compose run --rm app npm run db:migrate
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000

META_VERIFY_TOKEN=
META_ACCESS_TOKEN=
META_PHONE_NUMBER_ID=
META_API_VERSION=v23.0

DB_PROVIDER=postgres
DB_URI=postgresql://postgres:postgres@postgres:5432/client_wa

QUEUE_PROVIDER=lavinmq
QUEUE_URI=amqp://guest:guest@lavinmq:5672
WHATSAPP_INCOMING_QUEUE=wa.incoming.messages
```

Supported queue providers:

- `lavinmq`
- `rabbitmq`
- `bullmq`

Supported DB providers:

- `postgres`
- `mongo`

Business-flow code imports generic repositories and does not import `pg`, `mongodb`, BullMQ, or AMQP libraries directly.

## Meta Webhook Callback

Expose the app with a tunnel for local testing:

```bash
ngrok http 3000
```

Use this callback URL in the Meta Developer Portal:

```text
https://<ngrok-subdomain>.ngrok-free.app/webhook
```

Set the same `META_VERIFY_TOKEN` in Meta and `.env`.

## Render Deployment

Render should run only Node.js processes. Use managed services for state:

- Supabase PostgreSQL via `DB_URI`
- CloudAMQP/LavinMQ via `QUEUE_URI`

Create two Render services from the same repo:

- Web Service command: `npm start`
- Background Worker command: `npm run worker`

Set environment variables in the Render dashboard. Do not run PostgreSQL or LavinMQ inside Render services.

Run the migration once against Supabase with `DB_PROVIDER=postgres` and `DB_URI` set:

```bash
npm run db:migrate
```
