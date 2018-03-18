module.exports = sandbox => sandbox.stub().returns({
  emitClientConnect: sandbox.stub(),
  emitClientDisconnect: sandbox.stub(),
  emitServerReady: sandbox.stub(),
  emitServerShuttingDown: sandbox.stub()
});
