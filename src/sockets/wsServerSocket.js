const WebSocket = require('ws');
const Client = require('../clients/client');
const ConsoleLogger = require('../loggers/consoleLogger');
const WsClientSocket = require('./wsClientSocket');

/** @class WsServerSocket */
class WsServerSocket {
  /**
   * @constructs WsServerSocket
   * @param {Server} server
   * @param {Object?} options
   * @param {Logger?} options.logger
   * @param {number?} options.port
   */
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
    this.socket = null;

    /**
     * @member WsServerSocket#options
     * @type {Object}
     */
    this.options = options;
  }

  listen() {
    this.socket = new WebSocket.Server({
      port: this.options.port || 8080,
      verifyClient: this.verifyClient
    });

    this.socket.on('connection', this.handleConnection.bind(this));
    this.socket.on('error', this.handleError.bind(this));
  }

  close() {
    return new Promise((resolve) => {
      this.server.shutdown();
      this.socket.close(() => resolve());
    });
  }

  // eslint-disable-next-line
  verifyClient(options, cb) {
    cb(true);
  }

  handleListening() {
    this.server.ready();
  }

  /**
   * @param {WebSocket} ws
   * @param {IncomingMessage} req
   */
  handleConnection(ws, req) {
    const socket = new WsClientSocket(ws, req);
    const client = new Client(socket);
    this.server.accept(client);
  }

  /**
   * @param {Error} error
   */
  handleError(error) {
    this.logger.error(error);
  }
}

module.exports = WsServerSocket;
