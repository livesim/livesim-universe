#!/usr/bin/env node

const Server = require('./server');
const WsServerSocket = require('./sockets/wsServerSocket');
const program = require('commander');

program
  .version('1.0.0')
  .option('-b, --bind', 'Bind URL')
  .option('-d, --database-url', 'Database URL')
  .option('-s, --store-url', 'Store URL')
  .option('-l, --log-file', 'Path to log file')
  .parse(process.argv);

const server = new Server();
const socket = new WsServerSocket(server, { port: 7777 });
socket.listen();

process.on('SIGINT', () => {
  socket.close();
});
