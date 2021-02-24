const express = require('express');
const { PrismaClient } = require('@prima/client');
const PORT = 3000;
const server = express();

server.use(express.json);

server.listen(PORT, () => {
    console.log('Listenting on port ${PORT}!');
});
