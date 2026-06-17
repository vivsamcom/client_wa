const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'client-wa-loan-demo' });
});

module.exports = router;
