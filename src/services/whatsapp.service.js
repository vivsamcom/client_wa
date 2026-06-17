const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

function graphUrl() {
  return `https://graph.facebook.com/${env.graphApiVersion}/${env.whatsappPhoneNumberId}/messages`;
}

async function sendWhatsAppMessage(to, message) {
  if (!env.whatsappToken || !env.whatsappPhoneNumberId) {
    logger.warn({ to, message }, 'WhatsApp credentials missing; skipping outbound send');
    return;
  }

  await axios.post(graphUrl(), message, {
    headers: {
      Authorization: `Bearer ${env.whatsappToken}`,
      'Content-Type': 'application/json'
    }
  });
}

async function sendText(to, body) {
  return sendWhatsAppMessage(to, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body }
  });
}

async function sendLanguageButtons(to) {
  return sendWhatsAppMessage(to, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: 'Welcome to LoanAssist. Please choose your preferred language.' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'LANG_EN', title: 'English' } },
          { type: 'reply', reply: { id: 'LANG_HI', title: 'Hindi' } },
          { type: 'reply', reply: { id: 'LANG_MR', title: 'Marathi' } }
        ]
      }
    }
  });
}

async function sendLoanMenu(to, language = 'English') {
  const text = language === 'Hindi'
    ? 'आप क्या करना चाहेंगे?'
    : language === 'Marathi'
      ? 'आपण काय करू इच्छिता?'
      : 'What would you like to do?';

  return sendWhatsAppMessage(to, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'NEW_LOAN', title: 'New Loan' } },
          { type: 'reply', reply: { id: 'CHECK_STATUS', title: 'Check Status' } },
          { type: 'reply', reply: { id: 'EMI_OPTIONS', title: 'EMI Options' } }
        ]
      }
    }
  });
}

module.exports = { sendText, sendLanguageButtons, sendLoanMenu };
