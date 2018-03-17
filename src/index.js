#!/usr/bin/env node

const program = require('commander');

program
  .version('1.0.0')
  .option('-b, --bind', 'Bind URL')
  .option('-d, --database-url', 'Database URL')
  .option('-s, --store-url', 'Store URL')
  .option('-l, --log-file', 'Path to log file')
  .parse(process.argv);
