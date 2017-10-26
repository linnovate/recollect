import request from 'request';
import RuleEngine from 'node-rules';

import {
  consume,
} from '../providers/rabbitmq';

import {
  produceByInfo,
} from '../helpers/ruleEngine';

const es = require('../providers/es');

const RULES_API = process.env.RULES_API;
const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;
let rules;

const getRules = () => new Promise((resolve, reject) => {
  if (rules) return resolve(rules);
  request(RULES_API, (error, response, body) => {
    if (error || response.statusCode !== 200) return reject(error);
    const R = new RuleEngine(JSON.parse(body));
    rules = R.toJSON();
    resolve(rules);
  });
});


const start = () => {
  getRules().then((_rules) => {
    consume(`${BASE_QUEUE_NAME}-index`, (msg, error, done) => {
      es.index(msg, (_err) => {
        if (_err) return error();
        done();
        return produceByInfo(msg, _rules);
      });
    });
  }).catch((err) => {
    console.error(err);
  });
};

module.exports = {
  start,
};
