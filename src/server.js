const ConsoleLogger = require('./loggers/consoleLogger');
const DummyRadio = require('./radios/dummyRadio');
const LocalDatabase = require('./databases/localDatabase');
const LocalStore = require('./stores/localStore');

/** @class Server */
class Server {
  /** @constructs Server */
  constructor(options = {}) {
    /**
     * @member Server#logger
     * @type {Logger}
     */
    this.logger = options.logger || new ConsoleLogger();

    /**
     * @member Server#radio
     * @type {Radio}
     */
    this.radio = options.radio || new DummyRadio();

    /**
     * @member Server#store
     * @type {Store}
     */
    this.store = options.store || new LocalStore();

    /**
     * @member Server#database
     * @type {Database}
     */
    this.database = options.database || new LocalDatabase();

    /**
     * @member Server#clients
     * @type {Array<Client>}
     */
    this.clients = [];
  }

  /**
   * @param {Client} client
   */
  accept(client) {
    this.clients.push(client);
    this.store.setClient(client);
    this.radio.emitClientConnect(client);
  }

  /**
   * @param {Client} client
   */
  disconnect(client) {
    const index = this.clients.indexOf(client);
    this.clients.splice(index, 1);
    this.store.deleteClient(client);
    this.radio.emitClientDisconnect(client);
  }
}

module.exports = Server;
