import {
  connect,
  produce,
} from '../providers/rabbitmq';

connect().then((err) => {
  if (err) throw err;
});

export default function (qname, msg, cb) {
  produce(qname, msg).then((data) => {
    cb(null);
  }).catch((err) => {
    cb(err);
  });
}
