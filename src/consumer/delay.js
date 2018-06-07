import request from 'request';
import {
  consume,
  produce
} from '../providers/rabbitmq';

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const start = () => {
  consume(`${BASE_QUEUE_NAME}-delay`, (msg, error, done) => {
    console.log('message from delay queue');
    msg.noResultQueue = 'email';
    produce(`${BASE_QUEUE_NAME}-searchElastic`, msg);
    return done()
  });
};

module.exports = {
  start,
};