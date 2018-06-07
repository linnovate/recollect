import {
  connect,
} from '../providers/rabbitmq';

import * as webhooks from './webhook';
import * as delay from './delay';
import * as searchElastic from './searchElastic';
import * as email from './email';
import * as es from './es';
import * as checkRules from './check-rules';

const startConsuming = () => {
  es.start();
  checkRules.start();
  webhooks.start();
  delay.start();
  searchElastic.start();
  email.start()
};

setTimeout(() => {
  connect().then((err) => {
    if (err) throw err;
    startConsuming();
  });
}, 0);
