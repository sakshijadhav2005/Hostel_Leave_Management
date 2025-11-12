require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { initRealtime } = require('./utils/realtime')

const connectDB = require('./db/index')
const auth = require('./routes/auth') 
const app = express()
const httpServer = createServer(app)
initRealtime(httpServer)


app.use(cors())
app.use(express.json())
connectDB()
// Routes
app.use('/api/health', require('./routes/health'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api', require('./routes/leaves'))
app.use('/api/complaints', require('./routes/complaints'))
app.use('/api/rector', require('./routes/rector'))
app.use('/api/rector/complaints', require('./routes/rectorComplaints'))

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

