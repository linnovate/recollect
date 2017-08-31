const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT;

import queue from './queue';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/api/create', (req, res) => {

  var msg = req.body;

  // validate message ...

  queue(msg, (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});