const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

function graphUrl() {
  return `https://graph.facebook.com/${env.metaApiVersion}/${env.metaPhoneNumberId}/messages`;
}

async function sendMessage(message) {
  if (!env.metaAccessToken || !env.metaPhoneNumberId) {
    logger.warn({ to: message.to, message }, 'WhatsApp credentials missing; skipping outbound send');
    return;
  }

  await axios.post(graphUrl(), message, {
    headers: {
      Authorization: `Bearer ${env.metaAccessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

async function sendText(to, body) {
  return sendMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body }
  });
}

async function sendInteractiveButtons(to, bodyText, buttons) {
  return sendMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((button) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title
          }
        }))
      }
    }
  });
}

module.exports = { sendMessage, sendText, sendInteractiveButtons };
