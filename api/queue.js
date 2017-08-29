const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME;

var conn;

amqp.connect(RABBITMQ_URL, function (err, connection) {
  if (err) throw err;
  conn = connection;

  conn.createConfirmChannel(function (err, ch) {
    if (err) throw err;
    ch.assertQueue(QUEUE_NAME, {
      durable: false
    }, function (err, ok) {
      if (err) throw err;
    });
  });
});


module.exports = function (msg, cb) {
  conn.createConfirmChannel(function (err, ch) {
    if (err) return cb(err);
    ch.assertQueue(QUEUE_NAME, {
      durable: false
    }, function (err, ok) {
      if (err) return cb(err);
      ch.sendToQueue(QUEUE_NAME, Buffer.from(msg), {}, function (err, ok) {
        if (err) return cb(err);
        cb(null, ok);
      });
    });
  });
}