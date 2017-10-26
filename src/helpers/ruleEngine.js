import RuleEngine from 'node-rules';

import {
  produce,
} from '../providers/rabbitmq';

import {
  cloneObj,
  urlValidation,
} from './utils';


const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;
let R;

const produceByInfo = (data, rules) => {
  if (!R) {
    R = new RuleEngine(rules, {
      ignoreFactChanges: true,
    });
    R.fromJSON(rules);
  }

  const inputObject = {};
  inputObject.fact = data;
  inputObject.actions = [];
  inputObject.data = {};
  R.execute(inputObject, (result) => {
    console.log('afetr execute rules ', result);
    const copy = cloneObj(data);
    result.actions.forEach((action) => {
      switch (action.name) {
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
