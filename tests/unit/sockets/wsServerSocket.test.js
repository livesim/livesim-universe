const chai = require('chai');
const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();
const sinonChai = require('sinon-chai');

const Client = require('../../helpers/mocks/clients/fakeClient')(sandbox);
const ConsoleLogger = require('../../helpers/mocks/loggers/fakeLogger')(sandbox);
const Server = require('../../helpers/mocks/fakeServer')(sandbox);
const WebSocket = require('../../helpers/mocks/fakeWebSocket')(sandbox);
const WsClientSocket = require('../../helpers/mocks/sockets/fakeWsClientSocket')(sandbox);

const { expect } = chai;
chai.use(sinonChai);

describe('WsServerSocket', () => {
  let server;
  let wsServerSocket;
  let WsServerSocket;

  before(() => {
    server = new Server();
    WsServerSocket = rewire('../../../src/sockets/wsServerSocket');
    WsServerSocket.__set__('Client', Client);
    WsServerSocket.__set__('ConsoleLogger', ConsoleLogger);
    WsServerSocket.__set__('Server', Server);
    WsServerSocket.__set__('WebSocket', WebSocket);
    WsServerSocket.__set__('WsClientSocket', WsClientSocket);
  });

  context('when initialized with a `Server` and no options', () => {
    before(() => {
      wsServerSocket = new WsServerSocket(server);
    });

    after(() => {
      sandbox.restore();
    });

    it('stores the provided `Server` locally', () => {
      expect(wsServerSocket.server).to.be.deep.equal(server);
    });

    it('stores the empty options locally', () => {
      expect(wsServerSocket.options).to.be.deep.equal({});
    });

    it('uses a console logger', () => {
      expect(ConsoleLogger).to.have.been.calledWithNew;
      expect(wsServerSocket.logger).to.be.deep.equal(ConsoleLogger.firstCall.returnValue);
    });
  });

  context('when initialized with a `Server` and a custom port', () => {
    let options;

    before(() => {
      options = { port: 7777 };
      wsServerSocket = new WsServerSocket(server, options);
    });

    after(() => {
      sandbox.restore();
    });

    it('stores the provided options locally', () => {
      expect(wsServerSocket.options).to.be.deep.equal(options);
    });
  });

  context('when initialized with a `Server` and no options and the `listen` method is called', () => {
    before(() => {
      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.handleConnection.bind = sandbox.stub();
      wsServerSocket.handleError.bind = sandbox.stub();
      wsServerSocket.listen();
    });

    it('uses the default port', () => {
      expect(WebSocket.Server).to.have.been.calledWithMatch({ port: 8080 });
    });

    it('sets the `verifyClient` option to it\'s `verifyClient` method', () => {
      expect(WebSocket.Server).to.have.been.calledWithMatch({
        verifyClient: wsServerSocket.verifyClient
      });
    });

    it('listens for incoming connections', () => {
      expect(wsServerSocket.socket.on).to.have.been.calledWith(
        'connection',
        wsServerSocket.handleConnection.bind(wsServerSocket)
      );
    });

    it('listens for errors', () => {
      expect(wsServerSocket.socket.on).to.have.been.calledWith(
        'error',
        wsServerSocket.handleError.bind(wsServerSocket)
      );
    });
  });

  context('when initialized with a `Server` and a custom port and the `listen` method is called', () => {
    before(() => {
      wsServerSocket = new WsServerSocket(server, { port: 7777 });
      wsServerSocket.listen();
    });

    after(() => {
      sandbox.restore();
    });

    it('uses the provided port', () => {
      expect(WebSocket.Server).to.have.been.calledWithMatch({ port: 7777 });
    });
  });

  context('when the socket is listening', () => {
    before(() => {
      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.handleListening();
    });

    after(() => {
      sandbox.restore();
    });

    it('tells the `Server` that it\'s ready', () => {
      expect(server.ready).to.have.been.calledOnce;
    });
  });

  context('when a connection is being verified', () => {
    let cb;

    before(() => {
      cb = sandbox.stub();
      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.verifyClient({}, cb);
    });

    after(() => {
      sandbox.restore();
    });

    it('calls the callback function with `true` as parameter', () => {
      expect(cb).to.have.been.calledWith(true);
    });
  });

  context('when a connection has been accepted', () => {
    let ws;
    let req;
    let wsClientSocket;
    let client;

    before(() => {
      ws = sandbox.mock();
      req = sandbox.mock();

      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.handleConnection(ws, req);
    });

    after(() => {
      sandbox.restore();
    });

    it('creates a new `WsClientSocket` from `ws` and `req`', () => {
      expect(WsClientSocket).to.have.been.calledWithNew;
      expect(WsClientSocket).to.have.been.calledWithExactly(ws, req);
      wsClientSocket = WsClientSocket.firstCall.returnValue;
    });

    it('creates a new `Client` from the resulting `WsClientSocket`', () => {
      expect(Client).to.have.been.calledWithNew;
      expect(Client).to.have.been.calledWithExactly(wsClientSocket);
      client = Client.firstCall.returnValue;
    });

    it('tells the `server` to `accept` the resulting `Client`', () => {
      expect(wsServerSocket.server.accept).to.have.been.calledWithExactly(client);
    });
  });

  context('when an error has occured', () => {
    let error;

    before(() => {
      error = new Error('testing error');
      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.handleError(error);
    });

    after(() => {
      sandbox.restore();
    });

    it('logs it to the logger', () => {
      expect(wsServerSocket.logger.error).to.have.been.calledWithExactly(error);
    });
  });
});
