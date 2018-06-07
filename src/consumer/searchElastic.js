import request from 'request';
import {
    consume,
    produce
} from '../providers/rabbitmq';
const es = require('../providers/es');

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const start = () => {
    consume(`${BASE_QUEUE_NAME}-searchElastic`, (msg, error, done) => {
        console.log('message from searchElastic queue');
        const description = JSON.parse(msg.description);
        es.search({
            query: {
                "query": {
                  "bool": {
                    "must": [
                      {
                        "match_phrase": {
                          "description": description.email
                        }
                      },
                      {
                        "match_phrase": {
                          "event": msg.waitFor
                        }
                      },
                      {
                        "range": {
                          "created": {
                            "gte": msg.created
                          }
                        }
                      }
                    ]
                  }
                }
            }
        }).then((resp) => {
            console.log('aaaaaaaaaaaa', resp)
            if (resp.length === 0) produce(`${BASE_QUEUE_NAME}-${msg.noResultQueue}`, msg);
            return done();
        })
    });
};

module.exports = {
    start,
};
