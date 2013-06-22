/**
 *
 * User: adrianjones
 * Date: 6/21/13
 * Time: 3:02 PM
 */

var assert = require("assert");
var printer = require('../lib/pos_printer.js');
var printerOb = {host:'localhost', port :9100};
describe('Print Job', function(){

        it('test Simple print', function(done){

            printer.print(printerOb,'print1',function(result){
               done(result);
            })
        })

    it('test repeat print', function(){
var i = 0;
        for(i = 0 ; i < 300 ; i++){
        printer.print(printerOb,'print'+i,function(result){
            if (i > 298)
               done();
        })

        }
    })

})/**
 *
 * User: adrianjones
 * Date: 6/21/13
 * Time: 3:03 PM
 */
