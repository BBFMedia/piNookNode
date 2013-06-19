/**
 *
 * User: adrianjones
 * Date: 6/15/13
 * Time: 3:17 PM
 */

var net = require('net');




printerQueue = {
              printerConections : {},
    print : function(printer,data,callback){

      //  printer = { port :9100, hosts :'localhost'};
        var opt = {};
        console.log('printing on:');
        console.log(printer);
        opt.port = printer.port || 9100;
        opt.host = printer.host || 'localhost';

        var host = opt.host+':'+opt.port;
        var connection = printerQueue.printerConections[host];
        if (connection === undefined)
        {
            connection = {};
            connection.client = new net.Socket();
            printerQueue.printerConections[host] = connection;
            connection.client.on('error', function() {
                callback('error');
                console.log('connection Error');
            });
            connection.client.on('close', function() {

                console.log('closing');
            });
            connection.client.setTimeout(20000,function(){
                printerQueue.printerConections[host] = undefined;
            });
            connection.client.setKeepAlive(true,10000);

            console.log('connnecting..');
            console.log(opt);
            connection.client.connect(opt.port,opt.host,
                function() { //'connect' listener
                    console.log('client connected');
                    connection.client.write(data,'ascii' , function(){

                        callback('ok');
                    });

                });

        }
        else
        {
            connection.client.write(data,'ascii' , function(){

                callback('ok');
            });
        }



    }
}

module.exports = printerQueue;