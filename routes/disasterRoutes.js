const express = require('express')
const { addRegion } = require('../controllers/disasterController')
const router = express.Router()


router.post('/regions',addRegion)

module.exports = router