/**
 *
 * User: adrianjones
 * Date: 8/9/13
 * Time: 3:48 PM
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
var networkPrinter = function (opts) {
    var self = this;
    self.client = new net.Socket();
    self.client.setEncoding('binary');
    self.opt = opts;

};

networkPrinter.prototype.connect = function (opt, data) {
    var self = this;

    self.client.on('error', self.onError);
    self.client.on('close', self.onClose);

    console.log('connecting..');

    self.client.connect(opt.port, opt.host,
        function () { //'connect' listener
            console.log('client connected and printing');
            console.log(data);
            console.log(asc2hex(data));
            self.client.end(data, 'binary');

        });

};


networkPrinter.prototype.unref = function(){
    this.client.unref();
};
networkPrinter.prototype.setTimeout = function (timeout, func) {
    var self = this;
    self.client.setTimeout(5000, func);

};
module.exports = networkPrinter;