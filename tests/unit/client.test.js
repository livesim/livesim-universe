const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();
const sinonChai = require('sinon-chai');

const WsClientSocket = require('../helpers/mocks/sockets/fakeWsClientSocket')(sandbox);

const { expect } = chai;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Client', () => {
  let client;
  let Client;

  before(() => {
    Client = rewire('../../src/clients/client');
    Client.__set__('WsClientSocket', WsClientSocket);
  });

  context('when initialized', () => {
    let wsClientSocket;

    before(() => {
      wsClientSocket = new WsClientSocket();
      client = new Client(wsClientSocket);
    });

    it('stores the provided `socket` parameter', () => {
      expect(client.socket).to.be.deep.equal(wsClientSocket);
    });
  });

  context('when disconnecting', () => {
    let wsClientSocket;

    before(() => {
      wsClientSocket = new WsClientSocket();
      client = new Client(wsClientSocket);
      client.disconnect();
    });

    it('closes the connection', () => {
      expect(client.socket.close).to.have.been.calledOnce;
    });
  });
});
