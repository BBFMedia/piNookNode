/**
 *
 * User: adrianjones
 * Date: 6/21/13
 * Time: 7:17 PM
 */
var testFiles=["test/test.js","test/pos_printer.js"];


var Mocha = require('mocha');


var mocha = new Mocha;


mocha.reporter('spec').ui('bdd');


for (var i =0;i<testFiles.length;i++){


    mocha.addFile(testFiles[i]);


}

var runner = mocha.run(function(){

    console.log('finished');

});