import request from 'request';
import RuleEngine from 'node-rules';

import {
  consume,
  produce,
} from '../providers/rabbitmq';

import {
  urlValidation,
} from '../helpers/utils';

const RULES_API = process.env.RULES_API;
const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;
let rules;
let R;

const getRules = () => new Promise((resolve, reject) => {
  request(RULES_API, (error, response, body) => {
    if (error || response.statusCode !== 200) return reject(error);
    const Rl = new RuleEngine(JSON.parse(body));
    rules = Rl.toJSON();
    resolve(rules);
  });
});

setInterval(() => {
  getRules().then((_rules) => {
    console.log('########## UPDATE RULES ##################');
    R = new RuleEngine(_rules, {
      ignoreFactChanges: true,
    });
    R.fromJSON(rules);
  });
}, 30000);

const start = () => {
  getRules().then((_rules) => {
    R = new RuleEngine(_rules, {
      ignoreFactChanges: true,
    });
    R.fromJSON(rules);
    consume(`${BASE_QUEUE_NAME}-check-rules`, (msg, error, done) => {
      const inputObject = {};
      inputObject.fact = msg;
      inputObject.actions = [];
      inputObject.data = {};
      R.execute(inputObject, (result) => {
        result.actions.forEach((action) => {
          switch (action.name) {
            case 'webhook':
              if (!urlValidation(action.data.url)) break;
              msg.webhookUrl = action.data.url;
              msg.webhookMethod = action.data.method || 'POST';
              produce(`${BASE_QUEUE_NAME}-webhook`, msg);
              break;
            default:
              break;
          }
        });
        done();
      });
    });
  }).catch((err) => {
    console.error(err);
  });
};

module.exports = {
  start,
};
