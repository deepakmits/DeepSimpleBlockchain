'use strict';

const Inert = require('inert');
const Vision = require('vision');
const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Hapi=require('hapi');
const Blockchain = require('./Blockchain');
const Block = require('./Block');
const deepChain = new Blockchain();

//Create a server with a host and port
const server=Hapi.server({
	host:'localhost',
	port:8000
});

const swaggerOptions = {
		info: {
			'title': 'DeepSimpleBlockchain API Documentation',
			'version': '0.0.1',
		}
};


//Add the route
server.route({
	method:'GET',
	path:'/hello',
	config:{
		handler:function(request,h) {

			return'hello world';
		},
		tags: ['api'],
		description: 'Hello World',
		notes: 'First hapi program',
	}
});

//http://localhost:8000/block/0 
server.route({
	method:'GET',
	path:'/block/{height}',
	config:{
		tags: ['api'],
		description: 'Get Block at a given height',
		notes: 'Get Block at a given height, returns Block as JSON',
		validate: {
			params: {
				height : Joi.number()
				.required(),
			}
		},
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
	}

});

//http://localhost:8000/block/
server.route({
	method:'POST',
	path:'/block',
	config:{
		tags: ['api'],
		description: 'Add Block to current Blockchain',
		notes: 'Adds Block to current Blockchain, passing a block data as payload => {"body":"Block data"}',
		validate: {
			payload: {
				body : Joi.string()
				.required(),
			}
		},
		handler:async (request, h) => {
			if(request.payload == null)
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
	}

});


function errorHandler(request, h, errMsg) {
	return  h.response(errMsg).type('application/json');
}
//Start the server
async function start() {
	try {
		await server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
			]);
		await server.start();
	}
	catch (err) {
		console.log(err);
		process.exit(1);
	}

	console.log('Server running at:', server.info.uri);
}

start();