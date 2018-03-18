class Client {
  constructor(wsClientSocket) {
    this.socket = wsClientSocket;
  }

  disconnect() {
    this.socket.close();
  }
}

module.exports = Client;
