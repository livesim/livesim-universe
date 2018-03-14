const Client = require('./client');

class Server {
  constructor() {
    this.clients = [];
  }

  accept(socket) {
    this.clients.push(new Client(socket));
  }

  disconnect(client) {
    const index = this.clients.indexOf(client);
    this.clients.splice(index, 1);
  }
}

module.exports = Server;
