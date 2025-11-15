const { Server } = require('socket.io')

let io = null

function initRealtime(httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } })
  io.on('connection', (socket) => {
    try {
      console.log(`Socket connected: id=${socket.id} remote=${socket.handshake.address}`)
      socket.emit('hello', { ok: true })
    } catch (e) { console.error('Realtime connection handler error', e) }
    socket.on('disconnect', (reason) => {
      try { console.log(`Socket disconnected: id=${socket.id} reason=${reason}`) } catch (e) {}
    })
  })
  return io
}

function emitUpdate(type, payload) {
  if (io) io.emit(type, payload)
}

module.exports = { initRealtime, emitUpdate }
