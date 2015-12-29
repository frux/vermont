# vermont
[![Build Status](https://travis-ci.org/frux/vermont.svg?branch=master)](https://travis-ci.org/frux/vermont)
[![Coverage Status](https://coveralls.io/repos/frux/vermont/badge.svg?branch=master&service=github)](https://coveralls.io/github/frux/vermont?branch=master)

Ser**ver** **mon**i**t**oring tool

Vermont allow you to check your server's state. It can ping urls and exec shell commands.

## Usage
Vermont available to use right in [JS code](#usage) and as a [CLI application](#cli). The both checks (ping and exec) require parameter `expected` to be specified. It may be a number or a string. Vermont compares different values in order to `expected` type.

|expected|ping                  |exec          |
|--------|----------------------|--------------|
|number  |response status code  |exit code     |
|string  |response body         |command stdout|

For example: if you need to check that url answers 200 status code you should set `expected` to 200. But if you want to know that url answers 'ok' in its body you may set `expected` to `'ok'`. The `exec` method works just as well.

**NOTE**: If type of `expected` is a string it will be used as a **regular expression**.

**NOTE**: If `expected` parameter is not specified Vermont will use `200` for `ping` or `0` for `exec` as default.

## JS code
### Install
`npm i vermont`

### Usage
```js
var vermont = require('vermont');

vermont.ping('http://mysite.com', 200)
  .then(function(){ console.log('OK'); })
  .catch(function(error){ console.log('fail'); });
```

### Error object format
For ping method:
```js
{
  action: 'ping',
  url: 'http://mysite.com',
  expected: 200,
  received: 502,
  status: 'error'
}
```

For exec method:
```js
{
  action: 'exec',
  url: 'echo 2+2',
  expected: 5,
  received: 4,
  status: 'error'
}
```

## CLI
### Install
`npm i -g vermont`

### Usage
```vermont [OPTIONS] -f <CONFIG_FILE>```

### Available options
```
  -f, --file  Path to the config file
  -s, --sync  Run checks synchronously
  -h, --help  Show help
```

### Config file
Vermont config file contains checks. So far Vermont can only check different urls. Here is the example of config that checks some urls:
```json
[
  {
    "name": "test-1",
    "ping": "https://yandex.ru",
    "expected": 200
  },
  {
    "name": "test-2",
    "ping": "https://google.com",
    "expected": 200
  },
  {
    "name": "test-3",
    "ping": "https://facebook.com",
    "expected": 200
  }
]
```
