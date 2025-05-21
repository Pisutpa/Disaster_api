const express = require('express')
const morgan = require('morgan')
const { readdirSync } = require('fs')
const app = express()

// Middleware
app.use(express.json())
app.use(morgan('dev'))
// Routes

readdirSync('./routes').map((c)=>app.use('/api',require('./routes/'+c)))
// Start server

app.listen(3000,()=>console.log('server is run on port 3000'))