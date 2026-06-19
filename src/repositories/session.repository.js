const env = require('../platform/config/env');
const { getDbAdapter } = require('../platform/db/db.factory');

async function setLanguage({ waId, language }) {
  const db = getDbAdapter();

  if (env.dbProvider === 'mongo') {
    const mongo = await db.getDb();
    await mongo.collection('customer_preferences').updateOne(
      { waId },
      { $set: { waId, preferredLanguage: language, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return;
  }

  await db.query(
    `insert into customer_preferences (wa_id, preferred_language)
     values ($1, $2)
     on conflict (wa_id) do update set preferred_language = $2, updated_at = now()`,
    [waId, language]
  );
}

async function getLanguage(waId) {
  const db = getDbAdapter();

  if (env.dbProvider === 'mongo') {
    const mongo = await db.getDb();
    const pref = await mongo.collection('customer_preferences').findOne({ waId });
    return pref?.preferredLanguage || null;
  }

  const result = await db.query('select preferred_language from customer_preferences where wa_id = $1', [waId]);
  return result.rows[0]?.preferred_language || null;
}

module.exports = { setLanguage, getLanguage };
