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
    if (error)
      return reject(error);
    if (response.statusCode !== 200)
      return reject(body);
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
  })
    .catch((err) => {
    })
}, 50000);

const start = () => {
  getRules().then((_rules) => {
    R = new RuleEngine(_rules, {
      ignoreFactChanges: true,
    });
    R.fromJSON(rules);
    consume(`${BASE_QUEUE_NAME}-check-rules`, (msg, error, done) => {
      console.log('msg: ', msg);
      const inputObject = {};
      inputObject.fact = msg;
      inputObject.actions = [];
      inputObject.data = {};
      console.log('input object: ', inputObject);
      try {
        executeRule(inputObject, msg, done);
      } catch (err) {
        console.error(err);
        done();
      }
    });
  }).catch((err) => {
    console.error(err);
  });
};

module.exports = {
  start,
};

function executeRule(inputObject, msg, done) {
  console.log('executing rule');
  R.execute(inputObject, (result) => {
    console.log('done');
    console.log('result: ')
    console.log(require('util').inspect(result, {showHidden: false, depth: null}));
    result.actions.forEach((action) => {
      switch (action.name) {
        case 'webhook':
          if (!urlValidation(action.data.url)) break;
          msg.webhookUrl = action.data.url;
          msg.webhookMethod = action.data.method || 'POST';
          produce(`${BASE_QUEUE_NAME}-webhook`, msg);
          break;
        case 'delay':
          msg.waitFor = action.data.waitFor;
          msg.afterDelay = action.data.afterDelay;
          const delay = parseInt(action.data.time) * 60000;
          console.log('ssss', delay)
          produce(`${BASE_QUEUE_NAME}-delay`, msg, { delay });
          break;
        default:
          break;
      }
    });
    done();
  });
}
