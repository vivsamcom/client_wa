function extractMessages(payload = {}) {
  const messages = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};

      for (const message of value.messages || []) {
        const contact = (value.contacts || []).find((item) => item.wa_id === message.from) || {};
        const buttonReply = message.interactive?.button_reply;
        const listReply = message.interactive?.list_reply;

        messages.push({
          messageId: message.id,
          from: message.from,
          profileName: contact.profile?.name || null,
          type: message.type,
          text: message.text?.body || buttonReply?.title || listReply?.title || '',
          actionId: buttonReply?.id || listReply?.id || null,
          timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
          raw: message
        });
      }
    }
  }

  return messages;
}

module.exports = { extractMessages };
