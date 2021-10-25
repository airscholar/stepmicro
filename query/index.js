const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const postData = {};

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    postData[id] = {
      id,
      title,
      comments: [],
    };
  }

  if (type === 'CommentCreated') {
    const { id, postId, content, status } = data;

    const post = postData[postId];
    post.comments.push({ id, content, status });
    console.log('comment created =>', post);
  }

  if (type === 'CommentUpdated') {
    const { id, postId, content, status } = data;

    const post = postData[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    comment.content = content;
    comment.status = status;

    console.log('comment updated =>', post);
    // post.comments.push({ id, content, sta });
  }
};
app.get('/posts', (req, res) => {
  res.send({ posts: postData });
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log('Query server listening on 4002');

  const res = await axios.get('http://localhost:4005/events');

  for (const event of res.data) {
    console.log('processing event:', event.type);

    handleEvent(event.type, event.data);
  }
});
