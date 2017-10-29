import {
  connect,
} from '../providers/rabbitmq';

import * as webhooks from './webhook';
import * as es from './es';
import * as checkRules from './check-rules';

const startConsuming = () => {
  es.start();
  checkRules.start();
  webhooks.start();
};

connect().then((err) => {
  if (err) throw err;
  startConsuming();
});
