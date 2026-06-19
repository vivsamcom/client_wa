const env = require('../config/env');
const logger = require('../config/logger');
const { getQueueAdapter } = require('../queue/queue.factory');
const { verifyMetaSignature } = require('./signature');

async function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.metaVerifyToken) {
    logger.info('Webhook verified by Meta');
    return res.status(200).send(challenge);
  }

  logger.warn({ mode }, 'Webhook verification failed');
  return res.sendStatus(403);
}

async function receiveWebhook(req, res, next) {
  try {
    if (env.enableSignatureValidation) {
      const signature = req.header('x-hub-signature-256');
      const valid = verifyMetaSignature({ rawBody: req.rawBody, signature, appSecret: env.metaAppSecret });

      if (!valid) {
        logger.warn('Invalid Meta webhook signature');
        return res.sendStatus(401);
      }
    }

    await getQueueAdapter().publish({
      payload: req.body,
      receivedAt: new Date().toISOString()
    });

    return res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
}

module.exports = { verifyWebhook, receiveWebhook };
