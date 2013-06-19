var util = require('util'),
    vm = require("vm"),
    events = require('events'),
    fs = require('fs'),
    fork = require('child_process').fork,
    pos_printer = require('./pos_printer'),
    temp = require('temp'),
    _ = require("underscore");

var printerVM = function (opts, ddpclient) {
    var self = this;

    opts = opts || {};
    self._ddpclient = null;
    self.collections = ['printJobs'];
}

/**
 * Inherits from EventEmitter
 */
util.inherits(printerVM, events.EventEmitter);

printerVM.prototype.registered = function (result, token) {
    var self = this;
    console.log(result);
    self.printers = result.settings.printers;
    self.printernames = []
    console.log(self.printers);
    _.each(self.printers, function (ob, printer) {
        self.printernames.push(printer.trim());
    });

    self._ddpclient.subscribe('printJobs', [self.printernames], function () {

    });

}

printerVM.prototype.printJobs = function () {
    self = this;
    var printJobs = self._ddpclient.collections.printJobs;


    _.each(printJobs, function (job, id) {
        if (job.status != 'complete') {

            //   printer.print(job,printer_id, )
            _.each(self.printers, function (printer, index) {
                var printer_id = job.printer_id.split('^');

                if (index == printer_id[1]) {
                    pos_printer.print(printer, job.data,function(result){
                        if (result == 'ok')
                        {
                          self._ddpclient.call('printJobComplete', [id]);
                          self._ddpclient.collections.printJobs[id].status = 'complete';
                        }
                        else
                        {
                            if (!self._ddpclient.collections.printJobs[id].failCount) self._ddpclient.collections.printJobs[id].failCount = 0;
                            self._ddpclient.collections.printJobs[id].failCount++
                            if (self._ddpclient.collections.printJobs[id].failCount < 10)
                                            self.printJobs();
                                else
                                 console.log('stop')
                        }
                    });
                }
            })

            //

        }
    })
}

printerVM.prototype.change = function () {
    self = this;
    console.log('new print job');
    self.printJobs();
}
printerVM.prototype.remove = function () {

}
printerVM.prototype.update = function () {

}

printerVM.export = printerVM;
module.exports = printerVM;