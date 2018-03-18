module.exports = sandbox => sandbox.stub().returns({
  ready: sandbox.stub(),
  accept: sandbox.stub()
});
