/**
 *
 * User: adrianjones
 * Date: 6/15/13
 * Time: 3:17 PM
 */

var networkPrinter = require('./networkPrinter');




var printerQueue = {
    printQue: [],
    printerConections: {},
    print: function (printer, data, callback) {

        data = {printer: printer, data: data, callback: callback};
        printerQueue.printQue.push(data);
        callback('ok');
        printerQueue.runPrint();

    },
    runPrintTimer: function () {
        clearTimeout(printerQueue.timer);
        // pause before next print
        printerQueue.timer = setTimeout(function () {
            printerQueue.running = false;
            printerQueue.runPrint();
        }, 1000);

    },

    runPrint: function () {
        var opt = {},
            client = null;
        // a safty print clear. the timer gets reset every time it is called.
        clearTimeout(printerQueue.timer2);
        printerQueue.timer2 = setTimeout(function () {
            printerQueue.running = false;
            printerQueue.runPrint();
        }, 60000);

        //  printer = { port :9100, hosts :'localhost'};
        if (printerQueue.running)
         {return;}

        var job = printerQueue.printQue.shift();
        if (job === undefined)
        { return; }
        printerQueue.running = true;
   //    job.printer = { port: 9100, host: 'localhost'};


        console.log('printing on:');
        console.log(job.printer);
        opt.port = job.printer.port || 9100;
        opt.host = job.printer.host || 'localhost';
        job.error = false;
        console.log(opt);
        client = new networkPrinter(opt);

        client.onError = function () {
            job.callback('error', job);
            job.error = true;
            printerQueue.runPrintTimer();
            console.log('connection Error');
        };
        client.onClose = function () {


            console.log('closing');
            printerQueue.runPrintTimer();
            if (!job.error)
              job.callback('done', job);

            client.unref();
            // client.destroy();

        };
        client.setTimeout(5000, function () {
            console.log('timeout');
            job.callback('error', job);
            printerQueue.runPrintTimer();
            client.unref();
            //   client.destroy();
        });

        console.log('connnecting..');

        client.connect(opt, job.data);

    }
};

module.exports = printerQueue;