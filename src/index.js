import './env';
import queue from './api/queue';
import {
  connect,
} from './providers/rabbitmq';

import * as webhooks from './consumer/webhook';
import * as delay from './consumer/delay';
import * as searchElastic from './consumer/searchElastic';
import * as email from './consumer/email';
import * as es from './consumer/es';
import * as checkRules from './consumer/check-rules';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const APP_PORT = process.env.APP_PORT;
const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;


const app = express();

app.use(cors());
app.use(bodyParser.json({
  limit: '50mb',
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));

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
app.post('/api/create', (req, res) => {
  const msg = req.body;
  msg.created = new Date();

  // validate message ...

  queue(`${BASE_QUEUE_NAME}-index`, msg, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

app.listen(APP_PORT, () => {
  console.log(`listening on *:${APP_PORT}`);
});