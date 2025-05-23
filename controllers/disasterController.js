
const { PrismaClient, DisasterType } = require('../generated/prisma')
const prisma = new PrismaClient()

const sgMail = require('@sendgrid/mail');
const twilio = require('twilio')
const Redis = require('ioredis')
const redis = new Redis()
const { getDisasterRisk } = require('../models/externalApiModel')
const { calculateRiskScore, classifyScore } = require('../models/riskLevel')
require('dotenv').config()


exports.addRegion = async (req, res) => {
  // บันทึกข้อมูล region ลงฐานข้อมูล
  try {
    const { name, latitude, longitude } = req.body
    console.log(name, latitude, longitude)
    //ตรวจสอบการกรอกข้อมูล
    const errors = []

    if (!name) errors.push('กรุณากรอกชื่อ')
    if (latitude === undefined) errors.push('กรุณากรอก latitude')
    if (longitude === undefined) errors.push('กรุณากรอก longitude')
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') })
    }
    const newRegion = await prisma.region.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    })
    res.status(201).json({
      message: 'เพิ่ม region สำเร็จ',
      data: newRegion,
    })
  } catch (error) {
    console.error('Error adding region:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่ม region' })
  }
}

exports.addAlertSettings = async (req, res) => {
  // บันทึก alert setting ลงฐานข้อมูล
  const { regionId, disasterType, threshold } = req.body
  const errors = []

  //ดึงค่า DisasterType จาก enum
  const allowedDisasterTypes = Object.values(DisasterType)

  if (!regionId) errors.push('กรุณากรอก regisionId')
  if (!disasterType || !allowedDisasterTypes.includes(disasterType)) {
    errors.push('กรุณากรอก disasterType')
  }
  if (threshold === undefined || threshold === null || isNaN(Number(threshold))) {
    errors.push('กรุณากรอก threshold ให้ถูกต้อง')
  }

  // ถ้ามี error ให้ส่งกลับ
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') })
  }
  try {
    //สร้าง alert setting เข้าdb
    const setting = await prisma.alertSetting.create({
      data: {
        regionId: Number(regionId),
        disasterType,
        threshold: Number(threshold)
      }
    })
    res.status(201).json(setting)
  } catch (error) {
    console.error('Error adding alert settings:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่ม alert settings' })
  }
}

exports.getDisasterRisks = async (req, res) => {
  try {
    const report = await prisma.alertSetting.findMany({
      include: { region: true },
    })

    const result = []

    for (const setting of report) {
      const region = setting.region
      const disasterType = setting.disasterType
      const cacheKey = `risk:${region.id}:${disasterType}`

      let data = await redis.get(cacheKey)
      if (data) {
        data = JSON.parse(data)
      } else {
        data = await getDisasterRisk(region, disasterType)
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 900)
      }

      const riskScore = calculateRiskScore(disasterType, data)
      const riskLevel = classifyScore(disasterType, riskScore)

      result.push({
        region: region.name,
        disasterType,
        data,
        riskScore,
        riskLevel,
      })
    }

    res.json(result)

  } catch (error) {
    console.error('Error fetching disaster risks:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล disaster risks' })
  }
}

exports.creatAlert = async (req, res) => {
  const { regionId, disasterType, level, message } = req.body;

  if (!regionId || !disasterType || !level || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // ดึงข้อมูล Region พร้อม AlertSettings ที่ตรงกับ disasterType
    const region = await prisma.region.findUnique({
      where: { id: regionId },
      include: {
        alertSettings: {
          where: { disasterType }
        }
      }
    });

    if (!region) {
      return res.status(404).json({ error: "Region not found." });
    }

    // สร้าง Alert
    const newAlert = await prisma.alert.create({
      data: {
        regionId,
        disasterType,
        level,
        message,
        timestamp: new Date()
      }
    });

    res.status(201).json(newAlert);

  } catch (err) {
    console.error("Error Creates Alert:", err);
    res.status(500).json({ error: "Failed to create alert." });
  }
};

exports.sendAlert = async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const pendingAlerts = await prisma.alert.findMany({
      where: { sent: false },
      include: { region: true },
    });

    console.log(`Found ${pendingAlerts.length} pending alerts`);

    if (pendingAlerts.length === 0) {
      return res.json({ status: 'success', sentCount: 0, message: 'No alerts to send' });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const alert of pendingAlerts) {
      if (!alert.region?.name || !alert.disasterType || !alert.level || !alert.message) {
        console.warn(` Alert ID ${alert.id} missing critical data, skipped.`);
        failedCount++;
        continue;
      }

      const message = ` แจ้งเตือนภัยพิบัติ
            ภูมิภาค: ${alert.region.name}
            ประเภท: ${alert.disasterType}
            ระดับ: ${alert.level}
            ข้อความ: ${alert.message}
            เวลา: ${new Date(alert.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;

      // fallback email
      const emailTo = alert.email || process.env.DEFAULT_EMAIL || 'pisut.patest@gmail.com';

      const emailMsg = {
        to: emailTo,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `แจ้งเตือนภัยพิบัติ - ${alert.region.name}`,
        text: message,
      };

      try {
        await sgMail.send(emailMsg);

        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            sent: true,
            sentAt: new Date(),
            channel: 'EMAIL',
           
          },
        });

        console.log(` Alert ID ${alert.id} sent to ${emailTo}`);
        successCount++;
      } catch (alertError) {
        console.error(` Failed to send alert ID ${alert.id}:`, alertError.message);

        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            sent: false,
            sentAt: null,
            channel: 'EMAIL',
           
          },
        });

        failedCount++;
      }
    }

    res.json({
      status: 'completed',
      sentCount: successCount,
      failedCount: failedCount,
      total: pendingAlerts.length,
    });
  } catch (error) {
    console.error(' Send alert error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send alerts', detail: error.message });
  }
};
