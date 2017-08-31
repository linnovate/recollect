const amqp = require('amqplib/');
const RABBITMQ_URL = process.env.RABBITMQ_URL;

let connection, channel;

const events = require('events');

const connect = () => {
  // connect rabbitmq, then connect/create channel.
  return amqp.connect(RABBITMQ_URL)
    .then(createChannel);
};

// connecting to channel, attaching to appropriate queue and perform
// user callback upon incoming messages.
// callback should accept 3 parameters: params (the message itself), error, done.
// error should be called whenever we want to signal that we've failed and we want to re-try process the message later
// done should be called whenever we want to signal that we've finished and the message should be erased from queue
const consume = (queueName, callback) => {

  return assertQueue(queueName)
    .then((ok) => {

      console.log(`Attached to queue: ${queueName}`);

      return channel.consume(queueName, function (msg) {
        // null msg is sent by RabbitMQ when consumer is cancelled (e.g. queue deleted)
        if (msg === null) {
          return;
        }
        // convert to object
        var messageContent = JSON.parse(msg.content.toString());

        console.log(`Received message from queue ${queueName}`);

        // just send the message.
        callback(messageContent,
          function err() {
            // negative-acks the message
            channel.nack(msg);
          },
          function done() {
            // acks the message
            channel.ack(msg);
          });

      });
    }).catch((err) => {
      console.log(`Error in consuming from ${queueName} : err`);
      throw err;
    });
};

// produce a message to specific queue.
// this method does not return anything no purpose;
// the client has nothing to do with such failures, the message jus't won't be sent
// and a log will be emitted.
const produce = (queueName, message) => {
  // create queue if not exists
  return assertQueue(queueName)
    .then(function (ok) {
      console.log(`Sending message to queue ${queueName}`);
      return channel.sendToQueue(queueName, new Buffer(JSON.stringify(message)));
    })
    .catch(function (err) {
      console.log(`Error in producing from ${queueName} : err`);
      throw err;
    });
};

function createChannel(conn) {
  connection = conn;
  return connection.createConfirmChannel()
    .then(function (ch) {
      channel = ch;
      channel.on('close', onChannelClose);
      channel.on('error', onChannelError);
      console.log('Connected to RabbitMQ.');
    });
}

// create queue if not exists
function assertQueue(queueName) {
  return channel.assertQueue(queueName, {
    durable: false
  });
}

// A channel will emit 'close' once the closing handshake (possibly initiated by calling close()) has completed;
// or, if its connection closes.
function onChannelClose() {
  console.log('Channel has closed.');
}

// A channel will emit 'error' if the server closes the channel for any reason.
// Such reasons include:
//  * an operation failed due to a failed precondition (usually something named in an argument not existing)
//  * an human closed the channel with an admin tool
// A channel will not emit 'error' if its connection closes with an error.
function onChannelError(err) {
  console.log('Channel has errored.', err);
}

export {
  connect,
  consume,
  produce,
}