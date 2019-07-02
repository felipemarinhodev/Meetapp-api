import express from 'express';

const server = express();
server.use(express.json());

server.get('/', (req, res) => {
  return res.json({ api: 'MeetApp do Felipe' });
});

server.listen(3300);
