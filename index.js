#!/usr/bin/env node
const {KatanServer} = require('./src/KatanServer');
const program = require('commander');

program
  .version('1.0.0')
  .option('-f, --file <filename>', 'Set the data file path')
  .option('-p, --port <number>', 'Set port number, default is 53411')
  .parse(process.argv);

const server = new KatanServer({
  port: program.port || 53411,
  file: program.file || process.cwd()+'/katan-db.json'
});

server.start();