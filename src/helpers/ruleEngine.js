import RuleEngine from 'node-rules';

import {
  produce,
} from '../providers/rabbitmq';

import {
  cloneObj,
  urlValidation,
} from './utils';

import rules from '../data/rules';

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;
const R = new RuleEngine(rules);

const produceByInfo = (data) => {
  const inputObject = {};
  inputObject.fact = data;
  inputObject.actions = [];
  inputObject.data = {};
  R.execute(inputObject, (result) => {
    const copy = cloneObj(data);
    result.actions.forEach((action) => {
      switch (action) {
        case 'webhook':
          if (!urlValidation(result.data.webhook)) break;
          copy.webhookUrl = result.data.webhook;
          produce(`${BASE_QUEUE_NAME}-webhook`, copy);
          break;
        default:
          console.log('default case');
      }
    });
  });
};

module.exports = {
  produceByInfo,
};
