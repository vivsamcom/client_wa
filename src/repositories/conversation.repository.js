const env = require('../config/env');
const postgresRepository = require('./postgresConversation.repository');
const mongoRepository = require('./mongoConversation.repository');

function getRepository() {
  if (env.dbProvider === 'mongo') return mongoRepository;
  return postgresRepository;
}

module.exports = getRepository();
