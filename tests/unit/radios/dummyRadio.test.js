const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();

const Client = require('../../helpers/mocks/clients/fakeClient')(sandbox);

describe('DummyRadio', () => {
  let dummyRadio;
  let DummyRadio;

  before(() => {
    DummyRadio = rewire('../../../src/radios/dummyRadio');
  });

  context('when initialized', () => {
    before(() => {
      dummyRadio = new DummyRadio();
    });

    it('does nothing', () => {});
  });

  context('when emitting a client connection', () => {
    let client;

    before(() => {
      client = new Client();
      dummyRadio = new DummyRadio();
      dummyRadio.emitClientConnect(client);
    });

    it('does nothing', () => {});
  });
});
