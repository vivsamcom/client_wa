const whatsapp = require('../platform/meta/whatsapp.service');
const { LANGUAGE_OPTIONS, LOAN_MENU } = require('./loan.constants');

function isGreeting(text = '') {
  return ['hi', 'hello', 'hey', 'start', 'namaste'].includes(text.trim().toLowerCase());
}

function normalizeSelection(messageContext) {
  return (messageContext.actionId || messageContext.text || '').trim().toLowerCase();
}

async function askLanguage(waId) {
  await whatsapp.sendInteractiveButtons(
    waId,
    'Welcome to LoanAssist. Please choose your preferred language.',
    LANGUAGE_OPTIONS.map(({ id, title }) => ({ id, title }))
  );
}

async function showLoanMenu(waId) {
  await whatsapp.sendText(waId, `Please choose an option:\n${LOAN_MENU.join('\n')}`);
}

async function handleMenuSelection(messageContext) {
  const selection = normalizeSelection(messageContext);

  if (selection === '1' || selection === 'apply for loan') {
    await whatsapp.sendText(
      messageContext.from,
      'Great. I can help you start a loan enquiry. Please reply with your city and required loan amount, e.g. "Pune, 5 lakh".'
    );
    return true;
  }

  if (selection === '2' || selection === 'check loan status') {
    await whatsapp.sendText(messageContext.from, 'Please share your application/reference number. Example: LAN123456.');
    return true;
  }

  if (selection === '3' || selection === 'emi details') {
    await whatsapp.sendText(messageContext.from, 'Please share loan amount, tenure and approximate interest rate. Example: 500000, 48 months, 10%.');
    return true;
  }

  if (selection === '4' || selection === 'talk to agent') {
    await whatsapp.sendText(messageContext.from, 'Sure. A loan advisor will connect with you shortly.');
    return true;
  }

  return false;
}

module.exports = { isGreeting, askLanguage, showLoanMenu, handleMenuSelection };
