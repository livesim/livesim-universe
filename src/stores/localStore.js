class LocalStore {
  constructor() {
    this.clients = {};
  }

  setClient(client) {
    this.clients[client.id] = client;
  }

  deleteClient(client) {
    delete this.clients[client.id];
  }
}

module.exports = LocalStore;
