'use strict'

const websocket = require('websocket-stream')
const http = require('http')
const EE = require('events')
const net = require('net')
const tls = require('tls')
const steed = require('steed')
const https = require('https')
const clone = require('clone')

function factory (list) {
  const servers = new EE()
  const protocols = {
    tcp: createNet,
    tls: createTls,
    ws: createWebsocket,
    wss: createSecureWebsocket
  }

  var instances = null
  var addresses = []

  servers.close = function (cb) {
    if (instances) {
      steed.map(instances, close, cb)
    } else if (cb) {
      cb(new Error('not started yet'))
    }
  }

  servers.addresses = function () {
    return clone(addresses)
  }

  const errored = !list.reduce(function (acc, opt) {
    if (!acc) {
      return false
    }

    const protocol = opt.protocol
    if (!protocols[protocol]) {
      process.nextTick(servers.emit.bind(servers, 'error'), new Error('Unknown protocol: ' + protocol))
      return false
    }
    return true
  }, true)

  if (errored) {
    return servers
  }

  steed.map(list, create, function (err, i) {
    if (err) {
      return servers.emit('error', err)
    }
    instances = i
    addresses = i.map((s) => s.address())
  })

  return servers

  function create (opts, cb) {
    protocols[opts.protocol](opts, cb)
  }

  function createNet (opts, cb) {
    const host = opts.hostname || opts.host
    const port = opts.port || 0

    const server = net.createServer(onStream)

    server.listen(port, host, function () {
      server.removeListener('error', cb)
      cb(null, server)
    })

    server.on('error', cb)
  }

  function createTls (opts, cb) {
    const host = opts.hostname || opts.host
    const port = opts.port || 0

    const server = tls.createServer(opts)
    server.on('secureConnection', onStream)

    server.listen(port, host, function () {
      server.removeListener('error', cb)
      cb(null, server)
    })

    server.on('error', cb)
  }

  function createWebsocket (opts, cb) {
    const host = opts.hostname || opts.host
    const port = opts.port || 0

    const server = http.createServer()

    websocket.createServer({
      server
    }, onStream)

    server.listen(port, host, function () {
      server.removeListener('error', cb)
      cb(null, server)
    })

    server.on('error', cb)
  }

  function createSecureWebsocket (opts, cb) {
    const host = opts.hostname || opts.host
    const port = opts.port || 0

    const server = https.createServer(opts)

    websocket.createServer({
      server
    }, onStream)

    server.listen(port, host, function () {
      server.removeListener('error', cb)
      cb(null, server)
    })

    server.on('error', cb)
  }

  function onStream (stream) {
    servers.emit('stream', stream)
  }

  function close (server, cb) {
    server.unref()
    server.close(cb)
  }
}

module.exports = factory
