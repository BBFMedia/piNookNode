/**
 *
 * User: adrianjones
 * Date: 6/15/13
 * Time: 3:17 PM
 */

var net = require('net');




printerQueue = {
              printQue : [],
              printerConections : {},
    print : function(printer,data,callback){

        var data = {printer : printer , data : data, callback: callback};
        printerQueue.printQue.push(data);
        callback('ok');
        printerQueue.runPrint();


    },
    runPrint : function(){
      //  printer = { port :9100, hosts :'localhost'};
      if (  printerQueue.running  )
         return;
        printerQueue.running = true;
        var job = printerQueue.printQue.shift();
        if (job == null)
            return;
         job.printer = { port :9100, hosts :'localhost'};

        var opt = {};
        console.log('printing on:');
        console.log(job.printer);
        opt.port = job.printer.port || 9100;
        opt.host = job.printer.host || 'localhost';


        var client = new net.Socket();

            client.on('error', function() {
                job.callback('error',job);

                console.log('connection Error');
            });
            client.on('close', function() {
                printerQueue.running = false;
                console.log('closing');
                printerQueue.runPrint();
                client.unref();
                client.destroy();

            });
        client.setTimeout(5000,function(){
            console.log('timeout');
            printerQueue.runPrint();
        });


            console.log('connnecting..');
            console.log(opt);
            client.connect(opt.port,opt.host,
                function() { //'connect' listener
                    console.log('client connected and printing');
                    client.end(job.data,'ascii' , function(){
                        job.callback('ok');

                    });

                });





    }
}

module.exports = printerQueue;