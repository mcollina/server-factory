'use strict'

const websocket = require('websocket-stream')
const http = require('http')
const EE = require('events')
const net = require('net')
const tls = require('tls')
const steed = require('steed')

function factory (list) {
  const servers = new EE()
  var instances = null

  steed.map(list, create, function (err, i) {
    if (err) {
      return servers.emit('error', err)
    }
    instances = i
  })

  servers.close = function (cb) {
    steed.map(instances, close, cb)
  }

  servers.addresses = function () {
    if (!instances) {
      return null
    }

    return instances.map((i) => i.address())
  }

  return servers

  function create (opts, cb) {
    switch (opts.protocol) {
      case 'tcp':
        createNet(opts, cb)
        break
      case 'tls':
        createTls(opts, cb)
        break
      case 'ws':
        createWebsocket(opts, cb)
        break
      default:
        cb(new Error('unknown protocol: ' + opts.protocol))
    }
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

  function onStream (stream) {
    servers.emit('stream', stream)
  }

  function close (server, cb) {
    server.unref()
    server.close(cb)
  }
}

module.exports = factory
