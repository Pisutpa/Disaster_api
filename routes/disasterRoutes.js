const express = require('express')
const { addRegion, addAlertSettings, getDisasterRisks, sendAlert , } = require('../controllers/disasterController')
const router = express.Router()


router.post('/regions',addRegion)
router.post('/alert-settings',addAlertSettings)
router.get('/disaster-risks',getDisasterRisks)
router.post('/alerts/send',sendAlert)

module.exports = router