'use strict'

const path = require('path')
const fs = require('fs')
const tls = require('tls')
const tap = require('tap')
const test = tap.test
const factory = require('..')

const servers = factory([{
  protocol: 'tls',
  port: 3035,
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

  const stream = tls.connect({ host: 'localhost', port: 3035, rejectUnauthorized: false })

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})

test('connect with data from server', (t) => {
  t.plan(1)

  const stream = tls.connect(Object.assign(servers.addresses()[0], { rejectUnauthorized: false }))

  stream.on('data', function (data) {
    t.equal(data.toString(), 'hello')
    stream.end()
  })

  stream.write('hello')
})
