const customerRepository = require('../repositories/customer.repository');
const messageRepository = require('../repositories/message.repository');
const sessionRepository = require('../repositories/session.repository');
const whatsapp = require('../platform/meta/whatsapp.service');
const { LANGUAGE_MAP } = require('./loan.constants');
const loanFlow = require('./loan-flow.service');

async function handleIncomingMessage(messageContext) {
  await customerRepository.upsertCustomer({
    waId: messageContext.from,
    profileName: messageContext.profileName
  });

  await messageRepository.saveIncomingMessage({
    messageId: messageContext.messageId,
    waId: messageContext.from,
    messageType: messageContext.type,
    body: messageContext.text,
    actionId: messageContext.actionId,
    rawPayload: messageContext.raw
  });

  if (loanFlow.isGreeting(messageContext.text)) {
    await loanFlow.askLanguage(messageContext.from);
    return;
  }

  if (LANGUAGE_MAP[messageContext.actionId]) {
    const language = LANGUAGE_MAP[messageContext.actionId];
    await sessionRepository.setLanguage({ waId: messageContext.from, language });
    await whatsapp.sendText(messageContext.from, `Language saved: ${language}`);
    await loanFlow.showLoanMenu(messageContext.from);
    return;
  }

  const language = await sessionRepository.getLanguage(messageContext.from);

  if (!language) {
    await loanFlow.askLanguage(messageContext.from);
    return;
  }

  if (await loanFlow.handleMenuSelection(messageContext)) {
    return;
  }

  await whatsapp.sendText(
    messageContext.from,
    'Thanks. We have received your details. A loan advisor flow can be connected here for eligibility, KYC, document upload and application tracking.'
  );
}

module.exports = { handleIncomingMessage };
