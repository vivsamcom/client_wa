const { pool } = require('../db/postgres');

async function upsertCustomer({ waId, profileName }) {
  const result = await pool.query(
    `insert into customers (wa_id, profile_name)
     values ($1, $2)
     on conflict (wa_id) do update set profile_name = coalesce($2, customers.profile_name), updated_at = now()
     returning *`,
    [waId, profileName]
  );
  return result.rows[0];
}

async function saveIncomingMessage({ messageId, waId, messageType, body, actionId, rawPayload }) {
  await pool.query(
    `insert into inbound_messages (message_id, wa_id, message_type, body, action_id, raw_payload)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (message_id) do nothing`,
    [messageId, waId, messageType, body, actionId, rawPayload]
  );
}

async function setLanguage({ waId, language }) {
  await pool.query(
    `insert into customer_preferences (wa_id, preferred_language)
     values ($1, $2)
     on conflict (wa_id) do update set preferred_language = $2, updated_at = now()`,
    [waId, language]
  );
}

async function getLanguage(waId) {
  const result = await pool.query('select preferred_language from customer_preferences where wa_id = $1', [waId]);
  return result.rows[0]?.preferred_language || null;
}

async function createLoanLead({ waId, loanType = 'Vehicle Loan', stage = 'LEAD_CREATED' }) {
  const result = await pool.query(
    `insert into loan_leads (wa_id, loan_type, stage) values ($1, $2, $3) returning *`,
    [waId, loanType, stage]
  );
  return result.rows[0];
}

module.exports = { upsertCustomer, saveIncomingMessage, setLanguage, getLanguage, createLoanLead };
