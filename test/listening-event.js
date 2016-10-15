'use strict'

const net = require('net')
const websocket = require('websocket-stream')
const tap = require('tap')
const factory = require('..')

tap.plan(3)

const servers = factory([{
  protocol: 'tcp',
  port: 3038
}, {
  protocol: 'ws',
  port: 3039
}])

servers.on('stream', function (stream) {
  // echo
  stream.pipe(stream)
})

tap.tearDown(servers.close.bind(servers))

servers.on('listening', function () {
  tap.pass('listening')

  tap.test('tcp', function (t) {
    t.plan(1)

    const stream = net.connect({ host: 'localhost', port: 3038 })

    stream.on('data', function (data) {
      t.equal(data.toString(), 'hello')
      stream.end()
    })

    stream.write('hello')
  })

  tap.test('ws', (t) => {
    t.plan(1)

    const stream = websocket('ws://localhost:3039')

    stream.on('data', function (data) {
      t.equal(data.toString(), 'hello')
      stream.end()
    })

    stream.write('hello')
  })
})
