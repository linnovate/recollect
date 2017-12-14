import queue from './queue';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT;
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
  const msg = req.body;
  msg.created = new Date();

  // validate message ...

  queue(`${BASE_QUEUE_NAME}-index`, msg, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

app.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
