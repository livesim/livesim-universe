const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();
const sinonChai = require('sinon-chai');

const Client = require('../helpers/mocks/clients/fakeClient')(sandbox);
const ConsoleLogger = require('../helpers/mocks/loggers/fakeLogger')(sandbox);
const DummyRadio = require('../helpers/mocks/radios/fakeRadio')(sandbox);
const LocalDatabase = require('../helpers/mocks/databases/fakeDatabase')(sandbox);
const LocalStore = require('../helpers/mocks/stores/fakeStore')(sandbox);

const { expect } = chai;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Server', () => {
  let server;
  let Server;

  before(() => {
    Server = rewire('../../src/server');
    Server.__set__('Client', Client);
    Server.__set__('ConsoleLogger', ConsoleLogger);
    Server.__set__('DummyRadio', DummyRadio);
    Server.__set__('LocalDatabase', LocalDatabase);
    Server.__set__('LocalStore', LocalStore);
  });

  context('when initialized with empty parameters', () => {
    before(() => {
      server = new Server();
    });

    after(() => {
      sandbox.restore();
    });

    it('has an empty client list', () => {
      expect(server.clients).to.be.instanceOf(Array);
      expect(server.clients.length).to.be.equal(0);
    });

    it('uses a local store', () => {
      expect(LocalStore).to.have.been.calledWithNew;
      expect(server.store).to.be.deep.equal(LocalStore.firstCall.returnValue);
    });

    it('uses a local database', () => {
      expect(LocalDatabase).to.have.been.calledWithNew;
      expect(server.database).to.be.deep.equal(LocalDatabase.firstCall.returnValue);
    });

    it('uses a console logger', () => {
      expect(ConsoleLogger).to.have.been.calledWithNew;
      expect(server.logger).to.be.deep.equal(ConsoleLogger.firstCall.returnValue);
    });
  });

  ['store', 'database', 'logger', 'radio'].forEach((key) => {
    context(`when initialized with a custom ${key}`, () => {
      let options;
      let value;

      before(() => {
        options = {};
        value = sandbox.stub();
        options[key] = value;
        server = new Server(options);
      });

      after(() => {
        sandbox.restore();
      });

      it(`uses the provided ${key}`, () => {
        expect(server[key]).to.be.deep.equal(value);
      });
    });
  });

  context('when it receives a connection from a `Client`', () => {
    let client;

    before(() => {
      client = new Client();
      server = new Server();
      server.accept(client);
    });

    after(() => {
      sandbox.restore();
    });

    it('adds the `Client` to the list', () => {
      expect(server.clients.length).to.be.equal(1);
      expect(server.clients[0]).to.be.deep.equal(client);
    });

    it('stores the `Client` inside the store', () => {
      expect(server.store.setClient).to.have.been.calledWithExactly(client);
    });

    it('broadcasts the `Client` connection to the other servers', () => {
      expect(server.radio.emitClientConnect).to.have.been.calledWithExactly(client);
    });
  });

  context('when someone disconnects from it', () => {
    let client;

    before(() => {
      client = new Client();
      server = new Server();
      server.clients.push(client);
      server.disconnect(client);
    });

    after(() => {
      sandbox.restore();
    });

    it('removes the corresponding client entry from the client list', () => {
      expect(server.clients.length).to.be.equal(0);
    });

    it('removes the `Client` from the store', () => {
      expect(server.store.deleteClient).to.have.been.calledWithExactly(client);
    });

    it('broadcasts the `Client` disconnection to the other servers', () => {
      expect(server.radio.emitClientDisconnect).to.have.been.calledWithExactly(client);
    });
  });

  context('when the socket is listening', () => {
    before(() => {
      server = new Server();
      server.ready();
    });

    after(() => {
      sandbox.restore();
    });

    it('tells the other servers that the current server is alive', () => {
      expect(server.radio.emitServerReady).to.have.been.calledWithExactly(server);
    });
  });

  context('when the socket is closing', () => {
    let bob;
    let joe;

    before(() => {
      bob = new Client();
      bob.id = 'bob';

      joe = new Client();
      joe.id = 'joe';

      server = new Server();
      server.clients.push(bob);
      server.clients.push(joe);
      server.shutdown();
    });

    after(() => {
      sandbox.restore();
    });

    it('tells the other servers that the current server is shutting down', () => {
      expect(server.radio.emitServerShuttingDown).to.have.been.calledWithExactly(server);
    });

    it('and tells every client about the shutdown', () => {
      expect(bob.disconnect).to.have.been.calledOnce;
      expect(joe.disconnect).to.have.been.calledOnce;
    });
  });
});
