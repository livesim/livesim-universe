module.exports = (sandbox) => {
  class MockedClient {
    constructor() {
      this.disconnect = sandbox.stub();
    }
  }

  return {
    MockedClient,
    StubbedClient: sandbox.stub().returns({
      disconnect: sandbox.stub()
    })
  };
};
