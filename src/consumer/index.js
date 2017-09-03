import {
  connect,
} from '../providers/rabbitmq';

import * as webhooks from './webhook';
import * as es from './es';

const startConsuming = () => {
  es.start();
  webhooks.start();
};

connect().then((err) => {
  if (err) throw err;
  startConsuming();
});
