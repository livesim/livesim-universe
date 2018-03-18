module.exports = (sandbox) => {
  class FakeClient {
    constructor() {
      this.disconnect = sandbox.stub().resolves();
    }
  }

  return FakeClient;
};
