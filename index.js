'use strict';

const got = require('got');
const path = require('path');
const seenk = require('seenk');
const chalk = require('chalk');

function runConfig(configPath, sync){
	let checks,
		config;

	if(!path.isAbsolute(configPath)){
		configPath = path.resolve(process.cwd(), configPath);
	}

	config = require(configPath);

	if(config.length){
		if(sync){
			return seenk(function*(){
				for(let check of config){
					yield ping(check.ping, check.expected)
						.then(() =>{
							_logPing({ url, status: 'ok' }, check.name);
						})
						.catch(err => {
							_logPing(err, check.name);
						});
				}
			});
		}else{
			checks = config.map(check => {
				return ping(check.ping, check.expected)
					.then(() =>{
						_logPing({ url: check.ping, status: 'ok' }, check.name);
					})
					.catch(err => {
						_logPing(err, check.name);
					});
			});

			return seenk(checks);
		}
	}else return Promise.resolve(true);
}

function _checkStatusCode(expected, received, url){
	if(received !== expected){
		return {
			action: 'ping',
			url,
			expected,
			received,
			status: 'error',
			error: 'Unexpected status code'
		};
	}else{
		return true;
	}
}

function ping(url, expectedStatucCode){
	isNaN(expectedStatucCode) && (expectedStatucCode = 200);

	return new Promise((resolve, reject) => {
		got(url, (error, body, response) => {
			const receivedStatusCode = (error ? error.statusCode: response.statusCode);
			const result = _checkStatusCode(expectedStatucCode, receivedStatusCode, url);

			if(result === true){
				resolve(result);
			}else{
				reject(result);
			}
		});
	});
}

function _logPing(data, name){
	if(data.status === 'error'){
		console.log(`[${name || `ping ${data.url}`}] ${chalk.red(`FAILED ${data.error}; Received ${data.received} Expected ${data.expected}`)}`);
	}else{
		console.log(`[${name || `ping ${data.url}`}] ${chalk.green(`OK`)}`);
	}
}

module.exports = {
	ping,
	runConfig
};