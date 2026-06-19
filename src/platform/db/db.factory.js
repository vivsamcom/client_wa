const env = require('../config/env');

function getDbAdapter() {
  if (env.dbProvider === 'mongo') {
    return require('./mongo.adapter');
  }

  if (env.dbProvider === 'postgres') {
    return require('./postgres.adapter');
  }

  throw new Error(`Unsupported DB_PROVIDER: ${env.dbProvider}`);
}

module.exports = { getDbAdapter };
