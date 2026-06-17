const { getMongoDb } = require('../db/mongo');

async function upsertCustomer({ waId, profileName }) {
  const db = await getMongoDb();
  await db.collection('customers').updateOne(
    { waId },
    { $set: { waId, profileName, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  return db.collection('customers').findOne({ waId });
}

async function saveIncomingMessage({ messageId, waId, messageType, body, actionId, rawPayload }) {
  const db = await getMongoDb();
  await db.collection('inbound_messages').updateOne(
    { messageId },
    { $setOnInsert: { messageId, waId, messageType, body, actionId, rawPayload, createdAt: new Date() } },
    { upsert: true }
  );
}

async function setLanguage({ waId, language }) {
  const db = await getMongoDb();
  await db.collection('customer_preferences').updateOne(
    { waId },
    { $set: { waId, preferredLanguage: language, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
}

async function getLanguage(waId) {
  const db = await getMongoDb();
  const pref = await db.collection('customer_preferences').findOne({ waId });
  return pref?.preferredLanguage || null;
}

async function createLoanLead({ waId, loanType = 'Vehicle Loan', stage = 'LEAD_CREATED' }) {
  const db = await getMongoDb();
  const doc = { waId, loanType, stage, createdAt: new Date(), updatedAt: new Date() };
  const result = await db.collection('loan_leads').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

module.exports = { upsertCustomer, saveIncomingMessage, setLanguage, getLanguage, createLoanLead };
