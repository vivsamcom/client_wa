function extractMessages(payload) {
  const messages = [];
  const entries = payload.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      for (const message of value.messages || []) {
        const contact = (value.contacts || []).find((c) => c.wa_id === message.from) || {};
        const interactive = message.interactive;
        const buttonReply = interactive?.button_reply;
        const listReply = interactive?.list_reply;
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
