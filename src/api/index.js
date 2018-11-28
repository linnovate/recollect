import queue from './queue';
import './../env';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const APP_PORT = process.env.APP_PORT;
const BASE_QUEUE_NAME = process.env.BASE_QUEUE_NAME;

const app = express();

app.use(cors());
app.use(bodyParser.json({
  limit: '50mb',
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));

app.post('/api/create', (req, res) => {
 console.log('request body: ', req.body)
  const msg = req.body;
  msg.created = new Date();

  // validate message ...

  queue(`${BASE_QUEUE_NAME}-index`, msg, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

app.listen(APP_PORT, () => {
  console.log(`listening on *:${APP_PORT}`);
});
