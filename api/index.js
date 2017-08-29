const express = require('express');
const bodyParser = require('body-parser');
const queue = require('./queue');

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/api/create', (req, res) => {

  var msg = req.body;

  // validate message ...

  queue(new Buffer(JSON.stringify(msg)), (err, ok) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});