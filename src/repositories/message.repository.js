const env = require('../platform/config/env');
const { getDbAdapter } = require('../platform/db/db.factory');

async function saveIncomingMessage({ messageId, waId, messageType, body, actionId, rawPayload }) {
  const db = getDbAdapter();

  if (env.dbProvider === 'mongo') {
    const mongo = await db.getDb();
    await mongo.collection('inbound_messages').updateOne(
      { messageId },
      { $setOnInsert: { messageId, waId, messageType, body, actionId, rawPayload, createdAt: new Date() } },
      { upsert: true }
    );
    return;
  }

  await db.query(
    `insert into inbound_messages (message_id, wa_id, message_type, body, action_id, raw_payload)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (message_id) do nothing`,
    [messageId, waId, messageType, body, actionId, rawPayload]
  );
}

module.exports = { saveIncomingMessage };
