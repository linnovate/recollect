const amqp = require('amqplib/callback_api');
const es = require('./es');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME;

import {
  connect,
  consume
} from '../providers/rabbitmq';
// import { consumeByInfo } from '../helpers/data';

connect().then((err) => {
  if (err) throw err;
  consume(QUEUE_NAME, (msg, error, done) => {
    es.index(msg, (err, response) => {
      if (err) return error();
      done();
      // consumeByInfo();
    });
  });
});