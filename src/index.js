#!/usr/bin/env node

const Server = require('./server');
const WsServerSocket = require('./sockets/wsServerSocket');

const server = new Server();
const socket = new WsServerSocket(server, { port: 7777 });

socket.listen();
process.on('SIGINT', () => {
  socket.close();
});
