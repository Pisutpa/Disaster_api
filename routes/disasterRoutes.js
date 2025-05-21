const express = require('express')
const router = express.Router()


router.post('/regions',addRegion)

module.exports = router