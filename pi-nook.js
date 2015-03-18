#!/usr/bin/env node

var program = require('commander'),

    crypto = require("crypto"),
    AsteroidClient = require("./lib/asteroid_client.js"),
    bundle = require('./package.json'),
    printerVM = require('./lib/printer_vm.js');

console.log(process.env);
program
    .version(bundle.version)
    .option('-s, --server <host>', 'Asteroid server to connect to (default: pijs.io)')
    .option('-p, --port <port>', 'Port to connect to (default: 80', parseInt)
    .option('-v, --verbose', 'Enable verbose mode')
    .parse(process.argv);
var running = false;
require('getmac').getMac(function (err, macAddress) {
    if ((!running) && (!err)) {
        token = crypto.createHash('md5').update(macAddress).digest('hex');
        secret = crypto.createHash('md5').update(macAddress+macAddress).digest('hex');
        program.token = token;

        running = true;

        var opts = {
            'secret' : secret,
            'verbose': program.verbose || false,
            'token': program.token || bundle.token,
            'extraNodePath': '/usr/local/lib/node_modules'
        };
        if (program.server) {
            opts.host = program.server;
        }
        if (program.port) {
            opts.port = program.port;
        }
        console.log(opts);

        var client = new AsteroidClient(opts);
        var vm = new printerVM({});
        client.addPlugin(vm);
        client.connect();
    }
});
