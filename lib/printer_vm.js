var util = require('util'),
    events = require('events'),
    pos_printer = require('./pos_printer'),
    _ = require("underscore");

var printerVM = function (opts) {
    var self = this;

    opts = opts || {};
    self._ddpclient = null;
    self.collections = ['printJobs'];
};

/**
 * Inherits from EventEmitter
 */
util.inherits(printerVM, events.EventEmitter);

printerVM.prototype.registered = function (result) {
    var self = this;
    console.log(result);


    self._ddpclient.subscribe('printJobs', function () {

    });

};

printerVM.prototype.printJobs = function () {
    var self = this;
    var printJobs = self._ddpclient.collections.printJobs;


    _.each(printJobs, function (job, id) {
        if (job.status === 'ready') {

            //   printer.print(job,printer_id, )
            _.each(self.printers, function (printer, index) {
                var printer_id = job.printer_id.split('^');

                if (index === printer_id[1]) {
                    self._ddpclient.collections.printJobs[id].status = 'queued';
                    self._ddpclient.call('printJobStatus', [id,'queued']);
                    pos_printer.print(printer, job.data,function(result){
                        if (result === 'done')
                        {
                            self._ddpclient.collections.printJobs[id].status = 'sent';
                            self._ddpclient.call('printJobStatus', [id,'sent']);

                        }
                        else
                        {
                            self._ddpclient.collections.printJobs[id].status = 'error';
                            self._ddpclient.call('printJobStatus', [id,'error']);

                        }
                    });
                }
            });

            //

        }
    });
};

printerVM.prototype.change = function () {
    var self = this;
    console.log('new print job');
    self.printJobs();
};
printerVM.prototype.remove = function () {

};
printerVM.prototype.update = function () {

};

printerVM.export = printerVM;
module.exports = printerVM;
