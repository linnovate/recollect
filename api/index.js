const express = require('express');
const queue = require('./queue');

const PORT = process.env.PORT;

const app = express();

app.post('/api/create', (req, res) => {

  var msg = req.body;

  // validate message ...

  queue(msg, (err, ok) => {
    if(err) return res.sendStatus(500);
    res.sendStatus(200);
  })
})

app.listen(PORT, () => {
  console.log('listening on *:' + PORT);
})
