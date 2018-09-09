/* ===== Main JS ===================================
|  to test blockchain    |
|  =============================================================*/

const Blockchain = require('./simpleChain');
var chain = new Blockchain();

(function theLoop (i) {
    setTimeout(function () {
        var testBlk = Blockchain.getBlockInstance("Test Block - " + (i + 1));
        chain.addBlock(testBlk).then((res)=>{
            i++;
            if (i < 5) theLoop(i);
            else chain.validateChain();
        }).catch((err)=>{
        	console.log('Could not add block '+(i+1),err);
        });
    }, 1000);
})(0);
