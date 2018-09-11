'use strict';

const Hapi=require('hapi');
const Blockchain = require('./Blockchain');
const Block = require('./Block');
const deepChain = new Blockchain();

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Add the route
server.route({
    method:'GET',
    path:'/hello',
    handler:function(request,h) {

        return'hello world';
    }
});

//http://localhost:8000/block/0 
server.route({
    method:'GET',
    path:'/block/{height}',
    handler:async (request, h) => {
    	let height = encodeURIComponent(request.params.height);
    	let retBlock = await deepChain.getBlock(height).then((block) => {
    		return block;
    	}).catch((err) => {
    		console.log('Deep chain could not find required block '+height , err);
    		return errorHandler(request, h, 'Deep chain could not find required block '+height);
    	});
    	
    	return h.response(retBlock).type('application/json');
    }
});

//http://localhost:8000/block/
server.route({
    method:'POST',
    path:'/block',
    handler:async (request, h) => {
    	if(request.payload == null || 
    			(request.payload != null && (typeof request.payload.body  == 'undefined' 
    				|| encodeURIComponent(request.payload.body).length == 0))
    			)
    		return errorHandler(request, h, 'Block with empty body cannot be created/added.');
    	
    	let blockBody = encodeURIComponent(request.payload.body);
    	let newBlock = new Block(decodeURIComponent(blockBody));
    	let retBlock = await deepChain.addBlock(newBlock).then((block) => {
    		return block;
    	}).catch((err) => {
    		console.log('Deep chain could not add block', err);
    		return errorHandler(request, h, 'Deep chain could not add block '+err);
    	});
    	
    	return h.response(retBlock).type('application/json');
    }
});


function errorHandler(request, h, errMsg) {
	return  h.response(errMsg).type('application/json');
}
// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();