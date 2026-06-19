const env = require('../platform/config/env');
const { getDbAdapter } = require('../platform/db/db.factory');

async function upsertCustomer({ waId, profileName }) {
  const db = getDbAdapter();

  if (env.dbProvider === 'mongo') {
    const mongo = await db.getDb();
    await mongo.collection('customers').updateOne(
      { waId },
      { $set: { waId, profileName, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    return mongo.collection('customers').findOne({ waId });
  }

  const result = await db.query(
    `insert into customers (wa_id, profile_name)
     values ($1, $2)
     on conflict (wa_id) do update set profile_name = coalesce($2, customers.profile_name), updated_at = now()
     returning *`,
    [waId, profileName]
  );
  return result.rows[0];
}

module.exports = { upsertCustomer };
