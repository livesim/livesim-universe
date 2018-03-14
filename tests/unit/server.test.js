const rewire = require('rewire');
const { expect } = require('chai');
const sandbox = require('sinon').sandbox.create();

const Server = rewire('../../src/server');

describe('Server', () => {
  let Client;
  let server;
  const ws = {};

  before(() => {
    Client = sandbox.stub();
    Client.withArgs(ws).returns({
      socket: ws
    });

    Server.__set__('Client', Client);
    server = new Server();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when initialized', () => {
    it('has an empty client list', () => {
      expect(server.clients).to.be.instanceOf(Array);
      expect(server.clients.length).to.be.equal(0);
    });
  });

  context('when incoming connection', () => {
    after(() => {
      server.clients = [];
    });

    it('grants it', () => {
      expect(() => {
        server.accept(ws);
      }).to.not.throw();
    });

    it('inserts a new entry inside the clients list', () => {
      expect(server.clients.length).to.be.equal(1);
    });

    it('creates an entry being initialized from the `Client` class', () => {
      expect(Client.calledOnce).to.equal(true);
      expect(Client.calledWith(ws)).to.equal(true);
    });

    it('creates an entry having the same socket attribute as provided', () => {
      expect(server.clients[0].socket).to.equal(ws);
    });
  });

  context('when someone disconnects from it', () => {
    before(() => {
      const client = new Client({});
      server.clients.push(client);
      server.disconnect(client);
    });

    it('removes the corresponding client entry from the client list', () => {
      expect(server.clients.length).to.be.equal(0);
    });
  });
});
