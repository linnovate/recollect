import request from 'request';
import {
  consume,
  produce
} from '../providers/rabbitmq';
import {sendMail} from '../providers/mailer';

const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const start = () => {
  consume(`${BASE_QUEUE_NAME}-email`, (msg, error, done) => {
    console.log('message from email queue', msg);
    const description = JSON.parse(msg.description);
    sendMail({}, 'bookingStop', 'Booking Stop', description.email);
    return done();
  });
};

module.exports = {
  start,
};