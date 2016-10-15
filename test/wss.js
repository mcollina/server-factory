'use strict'

const path = require('path')
const fs = require('fs')
const websocket = require('websocket-stream')
const tap = require('tap')
const test = tap.test
const factory = require('..')

const servers = factory([{
  protocol: 'wss',
  port: 3036,
  key: fs.readFileSync(path.join(__dirname, 'fixture', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'fixture', 'cert.pem'))
}])

servers.on('stream', function (stream) {
  // echo
  stream.pipe(stream)
})

tap.tearDown(servers.close.bind(servers))

test('basic connect', (t) => {
  t.plan(1)

  const stream = websocket('wss://localhost:3036', { rejectUnauthorized: false })

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})

test('connect with data from server', (t) => {
  t.plan(1)

  const address = servers.addresses()[0]
  const stream = websocket(`wss://${address.address}:${address.port}`, { rejectUnauthorized: false })

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})
