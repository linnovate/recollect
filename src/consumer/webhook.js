import request from 'request';
import {
  consume,
} from '../providers/rabbitmq';

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const start = () => {
  consume(`${BASE_QUEUE_NAME}-webhook`, (msg, error, done) => {
    console.log('message from webhook queue', msg);
    return done();
    // const options = {
    //   uri: msg.webhookUrl,
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   form: msg,
    // };

    // request(options, (err, response, body) => {
    //   if (!err && response.statusCode >= 200 && response.statusCode < 300 && body.length) return done();
    //   return error();
    // });
  });
};

module.exports = {
  start,
};
