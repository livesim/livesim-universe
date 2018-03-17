const Client = require('../../../../src/clients/client');

/**
 * @param {SinonSandbox}
 * @returns {FakeClient}
 */
module.exports = () => {
  class FakeClient extends Client {
  }

  return FakeClient;
};
