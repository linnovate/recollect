import {
  produce,
} from '../providers/rabbitmq';

import { cloneObj, urlValidation } from './utils';

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;
const WEBHOOK_QUEUE = `${BASE_QUEUE_NAME}-webhook`;


const produceByInfo = (data) => {
  if (data.webhook) {
    const webhooks = data.webhook.split(',');
    webhooks.forEach((value) => {
      const valid = urlValidation(value);
      if (!valid) return;
      const copy = cloneObj(data);
      copy.webhookUrl = value;
      produce(WEBHOOK_QUEUE, copy);
    });
  }
};

module.exports = {
  produceByInfo,
};
