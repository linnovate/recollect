import {
  consume,
} from '../providers/rabbitmq';

import {
  produceByInfo,
} from '../helpers/data';

const es = require('../providers/es');

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const start = () => {
  consume(`${BASE_QUEUE_NAME}-index`, (msg, error, done) => {
    es.index(msg, (_err) => {
      if (_err) return error();
      done();
      return produceByInfo(msg);
    });
  });
};

module.exports = {
  start,
};
