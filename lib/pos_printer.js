/**
 *
 * User: adrianjones
 * Date: 6/15/13
 * Time: 3:17 PM
 */

var net = require('net');



function d2h(d) {
    return d.toString(16);
}
function asc2hex(tmp) {
    var str = '',
        i = 0,
        tmp_len = tmp.length,
        c;

    for (; i < tmp_len; i += 1) {
        c = tmp.charCodeAt(i);
        str += d2h(c) + ' ';
    }
    return str;
}

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
      //  job.printer = { port: 9100, host: 'localhost'};


        console.log('printing on:');
        console.log(job.printer);
        opt.port = job.printer.port || 9100;
        opt.host = job.printer.host || 'localhost';
        job.error = false;
        client = new net.Socket();
        client.setEncoding('binary');
        client.on('error', function () {
            job.callback('error', job);
            job.error = true;
            printerQueue.runPrintTimer();
            console.log('connection Error');
        });
        client.on('close', function () {

            console.log('closing');
            printerQueue.runPrintTimer();
            if (!job.error)
              job.callback('done', job);

            client.unref();
            // client.destroy();

        });
        client.setTimeout(5000, function () {
            console.log('timeout');
            job.callback('error', job);
            printerQueue.runPrintTimer();
            client.unref();
            //   client.destroy();
        });

        console.log('connnecting..');
        console.log(opt);
        client.connect(opt.port, opt.host,
            function () { //'connect' listener
                console.log('client connected and printing');
                console.log(job.data);
                console.log(asc2hex(job.data));
                client.end(job.data, 'binary');

            });

    }
};

module.exports = printerQueue;