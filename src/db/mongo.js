const { MongoClient } = require('mongodb');
const env = require('../config/env');

let client;
let db;

async function getMongoDb() {
  if (!client) {
    client = new MongoClient(env.mongodbUri);
    await client.connect();
    db = client.db(env.mongodbDb);
  }
  return db;
}

module.exports = { getMongoDb };
