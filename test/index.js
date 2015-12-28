const assert = require('assert');
const Gerkon = require('gerkon');
const vermont = require('../');

process.chdir(__dirname);

describe('Ping', () => {

	Gerkon
		.param('port', 3163)
		//.param('logs', 'string')
		.route('/ping/test1', (req, res) => res.send('pong'))
		.route('/ping/test2', (req, res) => res.sendCode(500))
		.route('/ping/test3', (req, res) => res.send('pong'))
		.init();

	it('should be ok if server returns expected status code', done => {
		vermont.ping('http://localhost:3163/ping/test1')
			.then(() => {
				done();
			})
			.catch(err => assert.fail(err));
	});

	it('should not be ok if server returns unexpected status code', done => {
		vermont.ping('http://localhost:3163/ping/test2', 200)
			.then((result) => {
				if(result !== true){
					assert.equal(result.error, 'Unexpected status code');
					done();
				}
			})
			.catch(() => {
				done();
			});
	});

	it('should runs checkings from config (abs path)', done => {
		vermont.runConfig(__dirname + '/vermont.json')
			.then(() => done())
			.catch(err => assert.fail(err));
	});

	it('should runs checkings from config (rel path)', done => {
		vermont.runConfig('./vermont.json')
			.then(() => done())
			.catch(err => assert.fail(err));
	});

	it('should runs checkings synchronously', done => {
		vermont.runConfig('./vermont.json', true)
			.then(() => done())
			.catch(err => assert.fail(err));
	});

	it('should throws if any check hasn`t passed', done => {
		vermont.runConfig('./vermont.bad.json')
			.then(() => assert.fail())
			.catch(err => done());
	});

	it('should not fail if config is empty', done => {
		vermont.runConfig('./vermont.empty.json')
			.then(() => done())
			.catch(err => assert.fail(err));
	});
});