module.exports = sandbox => sandbox.stub().returns({
  setClient: sandbox.stub(),
  deleteClient: sandbox.stub()
});
