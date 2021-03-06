# server-factory

Create multiple servers on different protocols: tcp, tls, ws, wss.
Emit `'stream'` when there is a new connection.

## Install

```
npm i server-factory --save
```

## Example

```js
'use strict'

const path = require('path')
const fs = require('fs')
const factory = require('.')

const servers = factory([{
  protocol: 'tcp',
  port: 3030
}, {
  protocol: 'ws',
  port: 3031
}, {
  protocol: 'tls',
  port: 3032,
  key: fs.readFileSync(path.join(__dirname, 'test', 'fixture', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'test', 'fixture', 'cert.pem'))
}, {
  protocol: 'wss',
  port: 3036,
  key: fs.readFileSync(path.join(__dirname, 'test', 'fixture', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'test', 'fixture', 'cert.pem'))
}])

servers.on('listening', function () {
  console.log('servers listening on', servers.addresses())
})

servers.on('stream', function (stream) {
  stream.pipe(stream)
})
```

## License

MIT
