const WebSocket = require('ws');
const Client = require('../clients/client');
const ConsoleLogger = require('../loggers/consoleLogger');
const WsClientSocket = require('./wsClientSocket');

/** @class WsServerSocket */
class WsServerSocket {
  /** @constructs WsServerSocket */
  constructor(server, options = {}) {
    /**
     * @member WsServerSocket#logger
     * @type {Logger}
     */
    this.logger = options.logger || new ConsoleLogger();

    /**
     * @member WsServerSocket#server
     * @type {Server}
     */
    this.server = server;

    /**
     * @member WsServerSocket#socket
     * @type {WebSocketServer}
     */
    this.socket = new WebSocket.Server({
      port: options.port || 8080,
      verifyClient: this.verifyClient
    });

    this.socket.on('connection', this.handleConnection);
    this.socket.on('error', this.handleError);
  }

  // eslint-disable-next-line
  verifyClient(options, cb) {
    cb(true);
  }

  handleListening() {
    this.server.ready();
  }

  handleConnection(ws, req) {
    const socket = new WsClientSocket(ws, req);
    const client = new Client(socket);
    this.server.accept(client);
  }

  handleError(error) {
    this.logger.error(error);
  }
}

module.exports = WsServerSocket;
