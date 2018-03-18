const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();

const { MockedClient } = require('../../helpers/mocks/clients/fakeClient')(sandbox);

describe('DummyRadio', () => {
  let dummyRadio;
  let DummyRadio;

  before(() => {
    DummyRadio = rewire('../../../src/radios/dummyRadio');
    dummyRadio = new DummyRadio();
  });

  context('when initialized', () => {
    it('does nothing', () => {});
  });

  context('when emitting a client connection', () => {
    let client;

    before(() => {
      client = new MockedClient();
      dummyRadio.emitClientConnect(client);
    });

    it('does nothing', () => {});
  });

  context('when emitting a server shutdown', () => {
    before(() => {
      dummyRadio.emitServerShuttingDown();
    });

    it('does nothing', () => {});
  });
});
