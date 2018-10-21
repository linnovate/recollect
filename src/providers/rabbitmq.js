const amqp = require('amqplib/');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MAX_RESEND_ATTEMPTS = process.env.RABBITMQ_MAX_RESEND_ATTEMPTS || 3;
const FAILED_JOBS_QUEUE = process.env.FAILED_JOBS_QUEUE_NAME || 'FailedJobsQueue';
const MAX_UNACKED_MESSAGES_AMOUNT = 1;
const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const events = require('events');

const eventEmitter = new events.EventEmitter();

let connection;
let channel;

// A channel will emit 'close' once the closing handshake (possibly initiated by calling close()) has completed;
// or, if its connection closes.
function onChannelClose() {
  console.log('Channel has closed.');
  eventEmitter.emit('channel.close');
}

// A channel will emit 'error' if the server closes the channel for any reason.
// Such reasons include:
//  * an operation failed due to a failed precondition (usually something named in an argument not existing)
//  * an human closed the channel with an admin tool
// A channel will not emit 'error' if its connection closes with an error.
function onChannelError(err) {
  console.log('Channel has errored.', err);
  eventEmitter.emit('channel.error');
}



function createChannel(conn) {
  connection = conn;
  return connection.createConfirmChannel()
    .then((ch) => {
      channel = ch;
      channel.on('close', onChannelClose);
      channel.on('error', onChannelError);
      console.log('in')
      channel.assertExchange('my-delay-exchange', "x-delayed-message", {autoDelete: false, durable: true, passive: true,  arguments: {'x-delayed-type':  "direct"}})
        .then((q) => {
          assertQueue(`${BASE_QUEUE_NAME}-delay`);
        }).then((q) => {
          bindQueue(`${BASE_QUEUE_NAME}-delay`)
        })
      console.log('Connected to RabbitMQ.');
    });
}

// create queue if not exists
function assertQueue(queueName) {
  return channel.assertQueue(queueName, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: queueName,
    maxPriority: 100,
  });
}

function bindQueue(queueName) {
  return channel.bindQueue(queueName, 'my-delay-exchange', queueName);
}

const connect = () => {
  // connect rabbitmq, then connect/create channel.
  console.log('connecting to ', RABBITMQ_URL, '...');
  return amqp.connect(RABBITMQ_URL)
    .then(createChannel)
    .catch((error) => {
      throw error;
    })};

// connecting to channel, attaching to appropriate queue and perform
// user callback upon incoming messages.
// callback should accept 3 parameters: params (the message itself), error, done.
// error should be called whenever we want to signal that we've failed and we want to re-try process the message later
// done should be called whenever we want to signal that we've finished and the message should be erased from queue
const consume = (queueName, callback) => assertQueue(queueName)
  .then((ok) => {
    console.log(`Attached to queue: ${queueName}`);
    channel.prefetch(MAX_UNACKED_MESSAGES_AMOUNT, false);

    return channel.consume(queueName, (msg) => {
      // null msg is sent by RabbitMQ when consumer is cancelled (e.g. queue deleted)
      if (msg === null) {
        return;
      }
      // convert to object
      const messageContent = JSON.parse(msg.content.toString());

      console.log(`Received message from queue ${queueName}`);
      console.log('message: ', messageContent);
      let currentTransmissionNum = 0;
      if (msg.properties.headers['x-death']) {
        currentTransmissionNum = msg.properties.headers['x-death'][0].count;
      }

      if (currentTransmissionNum > MAX_RESEND_ATTEMPTS) {
        console.log('Message exceeded resend attempts amount, passing to failed jobs queue...');
        // produce to failed jobs queue asynchrously then ack message from old queue
        produce(`${FAILED_JOBS_QUEUE}-${queueName}`, messageContent)
          .then(() => {
            channel.ack(msg);
            return Promise.resolve();
          });
      } else {
        // else, just send the message.
        // exponential backoff: calculate total sleep time in millis
        const totalSleepMillis = Math.pow(2, currentTransmissionNum) * 1000;
        setTimeout(() => {
          // invoke callback and pass an err & done method which acks the message
          callback(messageContent,
            () => {
              // negative-acks the message
              channel.nack(msg, false, false);
            },
            () => {
              // acks the message
              channel.ack(msg);
            });
        }, totalSleepMillis);
      }
    }, { noAck: false });
  }).catch((err) => {
    console.log(`Error in consuming from ${queueName} : err`);
    throw err;
  });

// produce a message to specific queue.
// this method does not return anything no purpose;
// the client has nothing to do with such failures, the message jus't won't be sent
// and a log will be emitted.

const produce = (queueName, message, options) =>
  // create queue if not exists
  assertQueue(queueName)
    .then((ok) => {
      console.log(`Sending message to queue ${queueName}`);
      options = options || {};
      options.persistent = true;
      if (options.delay) {
        options.headers = options.headers || {};
        options.headers['x-delay'] = options.delay
        return channel.publish('my-delay-exchange', queueName, new Buffer(JSON.stringify(message)), options);
      } else return channel.sendToQueue(queueName, new Buffer(JSON.stringify(message)), options);
    })
    .catch((err) => {
      console.log(`Error in producing from ${queueName} : err`);
      throw err;
    });

function deleteQueue(queueName) {
  return channel.deleteQueue(queueName)
    .catch((err) => {
      console.log('Error in deleting queue %s', queueName);
      throw err;
    });
}


export {
  connect,
  consume,
  produce,
  eventEmitter,
};
