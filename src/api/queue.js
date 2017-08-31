const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME;

import {
  connect,
  produce
} from '../providers/rabbitmq';

connect().then((err) => {
  if (err) throw err;
});

export default function (msg, cb) {
  produce(QUEUE_NAME, msg).then((data) => {
    cb(null);
  }).catch((err) => {
    cb(err);
  });
}