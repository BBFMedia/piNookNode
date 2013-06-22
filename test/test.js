/**
 *
 * User: adrianjones
 * Date: 6/21/13
 * Time: 3:02 PM
 */
var assert = require("assert")
describe('Array', function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        })
    })
})