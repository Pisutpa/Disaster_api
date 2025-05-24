const express = require('express')
const { addRegion, addAlertSettings, getDisasterRisks, sendAlert, creatAlert, getAlerts , } = require('../controllers/disasterController')
const router = express.Router()


router.post('/regions',addRegion)
router.post('/alert-settings',addAlertSettings)
router.get('/disaster-risks',getDisasterRisks)
router.post('/alerts/creats',creatAlert)
router.post('/alerts/send',sendAlert)
router.get('/alerts',getAlerts)
module.exports = router