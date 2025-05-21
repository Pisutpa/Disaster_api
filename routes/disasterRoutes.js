const express = require('express')
const { addRegion, addAlertSettings, getDisasterRisks , } = require('../controllers/disasterController')
const router = express.Router()


router.post('/regions',addRegion)
router.post('/alert-settings',addAlertSettings)
router.get('/disaster-risks',getDisasterRisks)

module.exports = router