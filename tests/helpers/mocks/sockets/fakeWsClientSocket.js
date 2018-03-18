module.exports = (sandbox) => {
  class FakeWsClientSocket {
    constructor() {
      this.close = sandbox.stub();
    }
  }

  return FakeWsClientSocket;
};
