# vermont
[![Build Status](https://travis-ci.org/frux/vermont.svg?branch=master)](https://travis-ci.org/frux/vermont)
[![Coverage Status](https://coveralls.io/repos/frux/vermont/badge.svg?branch=master&service=github)](https://coveralls.io/github/frux/vermont?branch=master)

serVER MONiToring tool

## Install for CLI usage
```bash
npm i -g vermont
```

## CLI Usage
```bash
vermont [OPTIONS] -f <CONFIG_FILE>
```

## Config file
Vermont config file contains checks. So far Vermont can only check different urls. Here is the example of config that checks some urls:
```json
[
  {
    "name": "test-1",
    "ping": "https://yandex.ru"
  },
  {
    "name": "test-2",
    "ping": "https://google.com"
  },
  {
    "name": "test-3",
    "ping": "https://facebook.com"
  }
]
```

## Available options

```
  -f, --file  Path to the config file
  -s, --sync  Run checks synchronously
  -h, --help  Show help
```
