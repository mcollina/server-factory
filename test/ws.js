'use strict'

const websocket = require('websocket-stream')
const tap = require('tap')
const test = tap.test
const factory = require('..')

const servers = factory([{
  protocol: 'ws',
  port: 3034
}])

servers.on('stream', function (stream) {
  // echo
  stream.pipe(stream)
})

tap.tearDown(servers.close.bind(servers))

test('basic connect', (t) => {
  t.plan(1)

  const stream = websocket('ws://localhost:3034')

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})

test('connect with data from server', (t) => {
  t.plan(1)

  const address = servers.addresses()[0]
  const stream = websocket(`ws://${address.address}:${address.port}`)

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})

test('set the protocol on addresses', (t) => {
  t.equal(servers.addresses()[0].protocol, 'ws')
  t.end()
})
