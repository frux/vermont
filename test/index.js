const assert = require('assert');
const should = require('should');
const Gerkon = require('gerkon');
const vermont = require('../');

process.chdir(__dirname);

describe('Ping', () => {
	const host = 'http://localhost:3163';

	Gerkon
		.param('port', 3163)
		//.param('logs', 'string')
		.route('/200', (req, res) => res.sendCode(200))
		.route('/502', (req, res) => res.sendCode(502))
		.route('/pong', (req, res) => res.send('pong'))
		.init();

	it('should expect default statusCode 200 if `expected` param is undefined', (done) => {
		vermont.ping(`${host}/200`)
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should compare with statusCode if `expected` param is a number', (done) => {
		vermont.ping(`${host}/200`, 200)
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should compare with body if `expected` param is a string', (done) => {
		vermont.ping(`${host}/pong`, 'pong')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should compare `expected` param as a regular expression', (done) => {
		vermont.ping(`${host}/pong`, '^[a-z]{4}$')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should not crash if server`s answer is empty', (done) => {
		vermont.ping(`${host}/200`, '^$')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should catch error if check has not passed', (done) => {
		vermont.ping(`${host}/502`, 200)
			.then(() => assert.fail())
			.catch(err => {
				err.should.eql({
					status: 'error',
					action: 'ping',
					url: `${host}/502`,
					expected: 200,
					received: 502
				});

				done();
			});
	});
});

describe('Exec', () => {
	it('should expect default exit code 0 if `expected` param is undefined', (done) => {
		vermont.exec('sh -c "exit 0;"')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should compare with statusCode if `expected` param is a number', (done) => {
		vermont.exec('sh -c "exit 1;"', 1)
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should compare with body if `expected` param is a string', (done) => {
		vermont.exec('echo test', 'test')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should compare `expected` param as a regular expression', (done) => {
		vermont.exec(`echo test`, '^[a-z]{4}$')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should not crash if server`s answer is empty', (done) => {
		vermont.exec('sh -c "exit 0;"', '^$')
			.then(() => done())
			.catch(err => assert.fail(err.expected, err.received));
	});

	it('should catch error if check has not passed', (done) => {
		vermont.exec(`echo foo`, 'bar')
			.then(() => assert.fail())
			.catch(err => {
				err.should.eql({
					status: 'error',
					action: 'exec',
					command: 'echo foo',
					expected: 'bar',
					received: 'foo'
				});

				done();
			});
	});
});

describe('Configs', () => {
	it('should run config if path is relative', done => {
		vermont.runConfig('./vermont.json')
			.then(() => done())
			.catch(err => assert.fail());
	});

	it('should run config if path is absolute', done => {
		vermont.runConfig(`${__dirname}/vermont.json`)
			.then(() => done())
			.catch(err => assert.fail());
	});

	it('should not fail if config has no checks', done => {
		vermont.runConfig(`${__dirname}/vermont.empty.json`)
			.then(() => done())
			.catch(err => assert.fail());
	});

	it('should catch if any check has not passed (async)', done => {
		vermont.runConfig(`${__dirname}/vermont.bad.json`)
			.then(() => assert.fail())
			.catch(err => done());
	});

	it('should run checks synchronously', done => {
		vermont.runConfig(`${__dirname}/vermont.json`, true)
			.then(() => done())
			.catch(err => assert.fail());
	});

	it('should catch if any check has not passed (sync)', done => {
		vermont.runConfig(`${__dirname}/vermont.bad.json`, true)
			.then(() => assert.fail())
			.catch(err => done());
	});
});


describe('General', () => {
	it('should catch error if `expected` neither number or string', done => {
		vermont.exec(`echo test`, [1, 2])
			.then(() => done())
			.catch(err => assert.eql(err, false));
	});
});