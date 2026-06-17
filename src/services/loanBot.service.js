const repository = require('../repositories/conversation.repository');
const { extractMessages } = require('../utils/extractMessage');
const { sendText, sendLanguageButtons, sendLoanMenu } = require('./whatsapp.service');
const logger = require('../config/logger');

const LANGUAGE_MAP = {
  LANG_EN: 'English',
  LANG_HI: 'Hindi',
  LANG_MR: 'Marathi'
};

function isGreeting(text = '') {
  return ['hi', 'hello', 'hey', 'start', 'namaste'].includes(text.trim().toLowerCase());
}

async function processMessage(message) {
  await repository.upsertCustomer({ waId: message.from, profileName: message.profileName });
  await repository.saveIncomingMessage({
    messageId: message.messageId,
    waId: message.from,
    messageType: message.type,
    body: message.text,
    actionId: message.actionId,
    rawPayload: message.raw
  });

  if (isGreeting(message.text)) {
    await sendLanguageButtons(message.from);
    return;
  }

  if (LANGUAGE_MAP[message.actionId]) {
    const language = LANGUAGE_MAP[message.actionId];
    await repository.setLanguage({ waId: message.from, language });
    await sendText(message.from, `Language saved: ${language}`);
    await sendLoanMenu(message.from, language);
    return;
  }

  if (message.actionId === 'NEW_LOAN') {
    await repository.createLoanLead({ waId: message.from });
    await sendText(message.from, 'Great. I can help you start a vehicle loan enquiry. Please reply with your city and required loan amount, e.g. "Pune, 5 lakh".');
    return;
  }

  if (message.actionId === 'CHECK_STATUS') {
    await sendText(message.from, 'Please share your application/reference number. Example: LAN123456.');
    return;
  }

  if (message.actionId === 'EMI_OPTIONS') {
    await sendText(message.from, 'Please share loan amount, tenure and approximate interest rate. Example: 500000, 48 months, 10%.');
    return;
  }

  const language = await repository.getLanguage(message.from);
  if (!language) {
    await sendLanguageButtons(message.from);
    return;
  }

  await sendText(message.from, 'Thanks. We have received your details. A loan advisor flow can be connected here for eligibility, KYC, document upload and application tracking.');
}

async function processWebhookPayload(payload, receivedAt) {
  const messages = extractMessages(payload);
  logger.info({ count: messages.length, receivedAt }, 'Processing WhatsApp messages');
  for (const message of messages) {
    await processMessage(message);
  }
}

module.exports = { processWebhookPayload };
