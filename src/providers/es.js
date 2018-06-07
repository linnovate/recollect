const elasticsearch = require('elasticsearch');

const ES_URL = process.env.ES_URL;
const ES_INDEX = process.env.ES_INDEX;

const client = new elasticsearch.Client({
  host: ES_URL,
});

const index = (doc, cb) => {
  client.index({
    index: ES_INDEX,
    type: doc.type || ES_INDEX,
    body: doc,
  }, cb);
};

const search = (doc) => {
  return client.search({
    index: ES_INDEX,
    type: doc.type || ES_INDEX,
    body: doc.query
  }).then((resp) => {
    return resp.hits.hits
  }, (err) => {
    return err
  });
}

module.exports = {
  index,
  search
};
