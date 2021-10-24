const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const postData = {};

app.get('/posts', (req, res) => {
  res.send({ posts: postData });
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    const { id, title } = data;

    postData[id] = {
      id,
      title,
      comments: [],
    };
  }

  if (type === 'CommentCreated') {
    const { id, postId, content } = data;

    const post = postData[postId];
    post.comments.push({ id, content });
  }

  console.log(postData);
  res.send({});
});

app.listen(4002, () => {
  console.log('Query server listening on 4002');
});
