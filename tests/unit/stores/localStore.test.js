const chai = require('chai');
const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();
const sinonChai = require('sinon-chai');

const { MockedClient } = require('../../helpers/mocks/clients/fakeClient')(sandbox);

const { expect } = chai;
chai.use(sinonChai);

describe('LocalStore', () => {
  let localStore;
  let LocalStore;

  before(() => {
    LocalStore = rewire('../../../src/stores/localStore');
  });

  context('when initialized', () => {
    before(() => {
      localStore = new LocalStore();
    });

    it('has an empty `clients` object', () => {
      expect(localStore.clients).to.be.instanceOf(Object);
      expect(Object.keys(localStore.clients).length).to.be.equal(0);
    });
  });

  context('when setting a new client', () => {
    let client;

    before(() => {
      client = new MockedClient();
      client.id = 'sample-id';

      localStore = new LocalStore();
      localStore.setClient(client);
    });

    it('stores the provided `client` locally', () => {
      expect(localStore.clients[client.id]).to.be.deep.equal(client);
    });
  });

  context('when setting an existing client', () => {
    let bob;
    let joe;

    before(() => {
      bob = new MockedClient();
      bob.id = 'sample-id';
      bob.name = 'bob';

      joe = new MockedClient();
      joe.id = 'sample-id';
      joe.name = 'joe';

      localStore = new LocalStore();
      localStore.clients[bob.id] = bob;
      localStore.setClient(joe);
    });

    it('replaces the existing client with the provided one', () => {
      expect(localStore.clients[bob.id]).to.be.deep.equal(joe);
    });
  });

  context('when deleting an existing client', () => {
    let bob;
    let joe;

    before(() => {
      bob = new MockedClient();
      bob.id = 'bob-id';
      bob.name = 'bob';

      joe = new MockedClient();
      joe.id = 'joe-id';
      joe.name = 'joe';

      localStore = new LocalStore();
      localStore.clients[bob.id] = bob;
      localStore.clients[joe.id] = joe;
      localStore.deleteClient(bob);
    });

    it('removes the corresponding client', () => {
      expect(Object.keys(localStore.clients).length).to.be.equal(1);
      expect(localStore.clients[bob.id]).to.be.undefined;
      expect(localStore.clients[joe.id]).to.be.deep.equal(joe);
    });
  });
});
