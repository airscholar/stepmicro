const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res, next) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res, next) => {
  const commentId = randomBytes(4).toString('hex');

  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  res.status(201).send(comments);
});

app.post('/events', async (req, res, next) => {
  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { id, content, status, postId } = data;

    const comments = commentsByPostId[postId];
    console.log('Comments =>', comments);
    const comment = comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        content,
        status,
        postId,
      },
    });
  }

  res.send({});
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Comments app listening on ${4001}`);
});
