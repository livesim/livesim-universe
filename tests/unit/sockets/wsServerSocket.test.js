const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();
const sinonChai = require('sinon-chai');

const { StubbedClient } = require('../../helpers/mocks/clients/fakeClient')(sandbox);
const ConsoleLogger = require('../../helpers/mocks/loggers/fakeLogger')(sandbox);
const Server = require('../../helpers/mocks/fakeServer')(sandbox);
const WebSocket = require('../../helpers/mocks/fakeWebSocket')(sandbox);
const WsClientSocket = require('../../helpers/mocks/sockets/fakeWsClientSocket')(sandbox);

const { expect } = chai;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('WsServerSocket', () => {
  let server;
  let wsServerSocket;
  let WsServerSocket;

  before(() => {
    server = new Server();
    WsServerSocket = rewire('../../../src/sockets/wsServerSocket');
    WsServerSocket.__set__('Client', StubbedClient);
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
    let boundHandleConnection;
    let boundHandleError;

    before(() => {
      wsServerSocket = new WsServerSocket(server);

      boundHandleConnection = wsServerSocket.handleConnection.bind(wsServerSocket);
      boundHandleError = wsServerSocket.handleError.bind(wsServerSocket);

      wsServerSocket.handleConnection.bind = sandbox.stub().returns(boundHandleConnection);
      wsServerSocket.handleError.bind = sandbox.stub().returns(boundHandleError);

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
        boundHandleConnection
      );
    });

    it('listens for errors', () => {
      expect(wsServerSocket.socket.on).to.have.been.calledWith(
        'error',
        boundHandleError
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

  context('when initialized with a `Server` and no options and the `close` method is called after the `listen` method', () => {
    let closeResult;

    before(() => {
      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.listen();
      closeResult = wsServerSocket.close();
    });

    it('returns a Promise', () => (
      expect(closeResult).to.have.fulfilled
    ));

    it('asks the server to shut down', () => {
      expect(server.shutdown).to.have.been.calledOnce;
    });

    it('closes the local socket', () => {
      expect(wsServerSocket.socket.close).to.have.been.calledOnce;
      expect(wsServerSocket.socket.close).to.have.been.calledAfter(server.shutdown);
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
    let client;
    let wsClientSocket;

    before(() => {
      ws = sandbox.mock();
      req = sandbox.mock();

      wsServerSocket = new WsServerSocket(server);
      wsServerSocket.handleConnection(ws, req);
    });

    after(() => {
      sandbox.restore();
    });

    it('creates a `WsClientSocket` from the client\'s socket', () => {
      expect(WsClientSocket).to.have.been.calledOnce;
      expect(WsClientSocket).to.have.been.calledWithNew;
      expect(WsClientSocket).to.have.been.calledWith(ws, req);
      wsClientSocket = WsClientSocket.firstCall.returnValue;
    });

    it('creates a `Client` from the previously created `WsClientSocket`', () => {
      expect(StubbedClient).to.have.been.calledOnce;
      expect(StubbedClient).to.have.been.calledWithNew;
      expect(StubbedClient).to.have.been.calledWith(wsClientSocket);
      client = StubbedClient.firstCall.returnValue;
    });

    it('tells the `server` to `accept` the created `Client`', () => {
      expect(client).to.be.deep.equal(wsServerSocket.server.accept.firstCall.args[0]);
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
