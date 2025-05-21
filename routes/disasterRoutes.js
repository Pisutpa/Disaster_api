const express = require('express')
const { addRegion, addAlertSettings , } = require('../controllers/disasterController')
const router = express.Router()


router.post('/regions',addRegion)
router.post('/alert-settings',addAlertSettings)

module.exports = router