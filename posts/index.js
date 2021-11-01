const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const posts = {};

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title,
    comments: [],
  };

  try {
    axios.post('http://event-bus-srv:4005/events', {
      type: 'PostCreated',
      data: {
        id,
        title,
        comments: [],
      },
    });
  } catch (err) {
    console.log(err.message);
  }
  res.status(201).json(posts[id]);
});

app.post('/events', (req, res, next) => {
  console.log('RECEIVED EVENT', req.body.type);

  res.send({});
});

app.listen(4000, () => {
  console.log('v 3.0');
  console.log('Server is running on port 4000');
});
