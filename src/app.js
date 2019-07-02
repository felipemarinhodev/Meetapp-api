const express = require('express');

const server = express();
server.use(express.json());

server.get("/", (req, res) => {
    return res.json({ 'api':'MeetApp' });
  });

  server.listen(3300);