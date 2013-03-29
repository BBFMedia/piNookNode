var     util = require('util'),
        events = require('events'),
        DDPClient = require("ddp"),
        bundle = require('../package.json'),
        AsteroidVM = require('./asteroid_vm.js');

/*
 * Connects and maintains connection to a remote asteroid server.
 */
var AsteroidClient = function(opts) {
  var self = this;

  // default arguments
  self.host = opts.host || 'pijs.io';
  self.port = opts.port || 3000;
  self.verbose = opts.verbose || false;
  self.token = opts.token || undefined;

  self._ddpclient = undefined;

  self._vm = new AsteroidVM();
  self._vm.on('writeConsole', function(level, msg) {
    self._writeConsole(level, msg);
  });
};

/**
 * Inherits from EventEmitter
 */
util.inherits(AsteroidClient, events.EventEmitter);

/*
 * Connects to a remote Asteroid server using the DDP protocol.
 */
AsteroidClient.prototype.connect = function() {
  var self = this;

  self._ddpclient = new DDPClient({ 'host': self.host, 'port': self.port});

  // If we receive a message notifying us that the code property of our device
  // description in database has changed, then let's re-run the code.
  self._ddpclient.on('message', function(msg) {
    if (self.verbose)
      console.log("DDP: %s", msg);
    var msg = JSON.parse(msg);
    if (msg.msg=='changed' && msg.collection == 'devices' && 'code' in msg.fields) {
      // Let the message be processed so that the local collection
      // is updated and then fire the event.
      // TODO: A better way to do that would be reactive collections.
      setTimeout(function() {
        self.emit('codeUpdated', msg.code);
      }, 0);
    }
  });

  self._ddpclient.on('socket-close', function(code, message) {
    console.warn("Socket closed: %s %s", code, message);
  });
  self._ddpclient.on('socket-error', function(error) {
    console.warn("Socket error: %s", error);
  });

  self._prepareHandlers();

  // Actually connect.
  self._ddpclient.connect(function() {
    self.emit('connected');
  });
};

AsteroidClient.prototype._prepareHandlers = function() {
  var self = this;

  /*
   * First step of connection is to actually be connected to the server.
   * Then we call the register method to identify ourselves and make sure
   * the server knows who we are.
   */
  self.on('connected', function() {
    self._ddpclient.call('register', [self.token, bundle.name, bundle.version],
      function(err, result) {
        if (!result) {
          console.log('Register result: %j (err: %j)', result, err);
          return;
        }
        else {
          self.emit('registered');
        }
      }
    );
  });

  /*
   * When we have identified ourselves, we are now 'registered', the next step
   * is to subscribe to updates to the object in database that describes this device.
   */
  self.on('registered', function() {
    self._ddpclient.subscribe('device-code', [self.token], function() {
      self.emit('subscribed');
    });
  });

  /*
   * Once subscribed, we can look at the local copy of our object and execute the code.
   */
  self.on('subscribed', function() {
    self.emit('codeUpdated');
  });

  /*
   * This is called when we initially subscribes or every time the device object is updated
   * by our subscription.
   */
  self.on('codeUpdated', function() {
    var devices = self._ddpclient.collections.devices;

    if (!(devices) || Object.keys(devices).length == 0) {
      console.warn("Apparently the server has no device object for me :(");
      return;
    }

    var deviceId = Object.keys(devices)[0];
    var device = devices[deviceId];

    self._writeConsole('RUNNER', 'Running code...');
    console.log("Running code: " + device.code);
    self._vm.run(device.code);
  });
}

/*
 * Writes a console message to the server. Fire-and-forget.
 */
AsteroidClient.prototype._writeConsole = function(level, msg) {
  var self = this;

  // Would be cool to keep a buffer of messages so that we can re-transmit them when
  // disconnected and/or group them in batch.
  self._ddpclient.call('writeConsole', [self.token, level, msg], function (err, result) {
    if (err) {
      console.warn("Error writing console message: %j", err);
    }
  });
}

AsteroidClient.export = AsteroidClient;

module.exports = AsteroidClient;
