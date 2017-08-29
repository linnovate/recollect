const elasticsearch = require('elasticsearch');

const ES_URL = process.env.ES_URL;
const ES_INDEX = process.env.ES_INDEX;

const client = new elasticsearch.Client({
  host: ES_URL,
});

module.exports = { index }

function index(doc, cb) {
  client.index({
    index: ES_INDEX,
    type: ES_INDEX,
    body: doc
  }, cb)
}
