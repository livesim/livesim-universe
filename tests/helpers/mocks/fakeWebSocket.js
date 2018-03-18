module.exports = sandbox => ({
  Server: sandbox.stub().returns({
    on: sandbox.stub()
  })
});
