const { Server } = require('socket.io')

let io = null

function initRealtime(httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } })
  io.on('connection', (socket) => {
    socket.emit('hello', { ok: true })
  })
  return io
}

function emitUpdate(type, payload) {
  if (io) io.emit(type, payload)
}

module.exports = { initRealtime, emitUpdate }
