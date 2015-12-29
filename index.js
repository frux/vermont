'use strict';

const got = require('got');
const path = require('path');
const child = require('child_process');
const seenk = require('seenk');
const chalk = require('chalk');
const actions = {
	ping,
	exec
};

function runConfig(configPath, sync){
	let config;

	if(!path.isAbsolute(configPath)){
		configPath = path.resolve(process.cwd(), configPath);
	}

	config = require(configPath);

	if(config.length){
		if(sync){
			return seenk(function*(){
				for(let check of config){
					let action = _getAction(check);

					yield actions[action](check[action], check.expected)
						.then(() => {
							_log({ status: 'ok' }, check.name);
						})
						.catch(err => {
							_log(err, check.name);
						});
				}
			});
		}else{
			return seenk(function*(){
				yield config.map(check => {
					let action = _getAction(check);

					return actions[action](check[action], check.expected)
						.then(() => {
							_log({ status: 'ok' }, check.name);
						})
						.catch(err => {
							_log(err, check.name);
							throw err;
						});
				});
			});
		}
	}else return Promise.resolve(true);
}

function _getAction(check){
	if(check.ping){
		return 'ping';
	}else{
		return 'exec';
	}
}

function _check(expected, received){
	let passed;

	if(typeof expected === 'number'){
		passed = (received === expected);
	}else{
		passed = new RegExp(expected).test(received);
	}

	if(passed){
		return true;
	}else{
		return {
			expected,
			received,
			status: 'error'
		};
	}
}

function ping(url, expected){

	//param expected might be either number or regular expression
	//if number provided Vermont will compare it with statusCode else with response body
	if(typeof expected !== 'number' && typeof expected !== 'string'){
		expected = 200;
	}

	return new Promise((resolve, reject) => {
		got(url, (error, body, response) => {
			let received,
				result;

			//if number expected Vermont will compare it with statusCode
			if(typeof expected === 'number'){
				received = (error || response).statusCode;

			//else with body
			}else{
				received = body || '';
			}

			result = _check(expected, received);

			if(result === true){
				resolve(result);
			}else{
				result.url = url;
				result.action = 'ping';
				reject(result);
			}
		});
	});
}

function exec(command, expected){

	//param expected might be either number or string or regular expression
	//if number provided Vermont will compare it with exit code else with stdout
	if(typeof expected !== 'number' && typeof expected !== 'string'){
		expected = 0;
	}

	return new Promise((resolve, reject) => {
		child.exec(command, (error, stdout, stderr) => {
			let received,
				result;

			//if number expected Vermont will compare it with exit code
			if(typeof expected === 'number'){
				received = (error ? error.code : 0);

			//else with stdout
			}else{
				received = stdout.toString().replace(/(^\n+|\n+$)/g, '') || '';
			}

			result = _check(expected, received);

			if(result === true){
				resolve(result);
			}else{
				result.command = command;
				result.action = 'exec';
				reject(result);
			}
		});
	});
}

function _log(data, actionName){
	let log = `[${actionName}] `;

	if(data.status === 'error'){
		log += `${chalk.red(`FAILED! Received ${data.received} Expected ${data.expected}`)}`;
	}else{
		log += chalk.green('OK');
	}

	console.log(log);
}

module.exports = {
	ping,
	exec,
	runConfig
};