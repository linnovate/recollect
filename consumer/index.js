const amqp = require('amqplib/callback_api');
const es = require('./es');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME;

amqp.connect(RABBITMQ_URL, function (err, conn) {
  if (err) throw err;
  conn.createConfirmChannel(function (err, ch) {
    if (err) return cb(err);
    ch.consume(QUEUE_NAME, function (msg) {
      var content = msg.content.toStrinng();
      es.index(content, (err, response) => {
        if (err) return ch.nack(msg);
        ch.ack(msg)
      })
    })
  });
});