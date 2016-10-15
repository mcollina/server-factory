'use strict'

const net = require('net')
const tap = require('tap')
const test = tap.test
const factory = require('..')

const servers = factory([{
  protocol: 'rocket'
}, {
  protocol: 'tcp',
  port: 3037
}])

servers.on('error', function () {
  tap.pass('should error')
})

servers.on('stream', function (stream) {
  // echo
  stream.pipe(stream)
})

tap.tearDown(servers.close.bind(servers))

test('basic connect', (t) => {
  t.plan(1)

  const stream = net.connect({ host: 'localhost', port: 3037 })

  stream.on('error', function () {
    t.pass('should error')
  })

  stream.on('data', function (data) {
    t.fail('there should be no connection')
    stream.end()
  })

  stream.write('hello')
})
