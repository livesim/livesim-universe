/**
 * @param {SinonSandbox}
 * @returns {FakeStore}
 */
module.exports = (sandbox) => {
  class FakeStore {
    constructor() {
      this.setClient = sandbox.stub();
      this.deleteClient = sandbox.stub();
    }
  }

  return FakeStore;
};
