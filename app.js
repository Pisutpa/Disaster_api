const express = require('express')
const morgan = require('morgan')
const { default: disasterRoutes } = require('./routes/disasterRoutes')
const app = express()

// Middleware
app.use(express.json())
app.use(morgan('dev'))
// Routes
app.use('/routes',disasterRoutes)

// Start server

app.listen(3000,()=>console.log('server is run on port 3000'))