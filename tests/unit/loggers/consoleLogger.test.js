const chai = require('chai');
const rewire = require('rewire');
const sandbox = require('sinon').sandbox.create();
const sinonChai = require('sinon-chai');

const FakeConsole = require('../../helpers/mocks/fakeConsole')(sandbox);

const { expect } = chai;
chai.use(sinonChai);

describe('ConsoleLogger', () => {
  let consoleLogger;
  let ConsoleLogger;

  before(() => {
    ConsoleLogger = rewire('../../../src/loggers/consoleLogger');
    ConsoleLogger.__set__('console', FakeConsole);
  });

  context('when we want to output an error message', () => {
    let error;

    before(() => {
      error = new Error('That error should appear');
      consoleLogger = new ConsoleLogger();
      consoleLogger.error(error);
    });

    it('outputs it with the console#error method', () => {
      expect(FakeConsole.error).to.have.been.calledWithExactly(error);
    });
  });
});
