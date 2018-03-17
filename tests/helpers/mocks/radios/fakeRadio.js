/**
 * @param {SinonSandbox}
 * @returns {FakeRadio}
 */
module.exports = (sandbox) => {
  class FakeRadio {
    constructor() {
      this.emitClientConnect = sandbox.stub();
      this.emitClientDisconnect = sandbox.stub();
    }
  }

  return FakeRadio;
};
