'use strict'

const net = require('net')
const tap = require('tap')
const test = tap.test
const factory = require('..')

const servers = factory([{
  protocol: 'tcp',
  port: 3033
}])

servers.on('stream', function (stream) {
  // echo
  stream.pipe(stream)
})

tap.tearDown(servers.close.bind(servers))

test('basic connect', (t) => {
  t.plan(1)

  const stream = net.connect({ host: 'localhost', port: 3033 })

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})

test('connect with data from server', (t) => {
  t.plan(1)

  const stream = net.connect(servers.addresses()[0])

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})

test('set the protocol on addresses', (t) => {
  t.equal(servers.addresses()[0].protocol, 'tcp')
  t.end()
})
