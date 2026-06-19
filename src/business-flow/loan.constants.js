const LANGUAGE_OPTIONS = [
  { id: 'LANG_EN', title: 'English', value: 'English' },
  { id: 'LANG_HI', title: 'Hindi', value: 'Hindi' },
  { id: 'LANG_MR', title: 'Marathi', value: 'Marathi' }
];

const LANGUAGE_MAP = LANGUAGE_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.value;
  return acc;
}, {});

const LOAN_MENU = [
  '1. Apply for Loan',
  '2. Check Loan Status',
  '3. EMI Details',
  '4. Talk to Agent'
];

module.exports = { LANGUAGE_OPTIONS, LANGUAGE_MAP, LOAN_MENU };
