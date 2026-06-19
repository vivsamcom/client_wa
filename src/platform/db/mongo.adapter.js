const { MongoClient } = require('mongodb');
const env = require('../config/env');

let client;
let db;

async function getDb() {
  if (!client) {
    client = new MongoClient(env.dbUri);
    await client.connect();
    db = client.db(env.mongoDbName);
  }
  return db;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { getDb, close };
