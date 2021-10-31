const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const events = [];

app.post('/events', async (req, res, next) => {
  const event = req.body;

  events.push(event);

  try {
    await axios.post('http://posts-clusterip-srv:4000/events', event); //post
    await axios.post('http://comments-srv:4001/events', event); // comment
    await axios.post('http://query-srv:4002/events', event); //query
    await axios.post('http://moderation-srv:4003/events', event); // moderation
  } catch (err) {
    console.log(err.message);
  }
  res.send({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log('App listening on port 4005!');
});
