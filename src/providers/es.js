const elasticsearch = require('elasticsearch');

const ES_URL = process.env.ES_URL;
const ES_INDEX = process.env.ES_INDEX;
const hosts = [ 
        process.env.ES_URL,
        process.env.ES_URL_NODE_1,
        process.env.ES_URL_NODE_2,
        process.env.ES_URL_NODE_3
     ];

for(let i in hosts){
  if(hosts[i] == null || hosts[i] === '')
    hosts.splice(i, 1);
}

console.log(hosts);

const client = new elasticsearch.Client({
  hosts: hosts
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
