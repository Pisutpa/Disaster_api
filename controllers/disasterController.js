const { PrismaClient, DisasterType } = require('@prisma/client');
const prisma = new PrismaClient()

exports.addRegion = async (req, res) => {
    // บันทึกข้อมูล region ลงฐานข้อมูล
    try {
        const { name, latitude, longitude } = req.body
        console.log(name, latitude, longitude);
        //ตรวจสอบการกรอกข้อมูล
        const errors = [];

        if (!name) errors.push('กรุณากรอกชื่อ');
        if (latitude === undefined) errors.push('กรุณากรอก latitude');
        if (longitude === undefined) errors.push('กรุณากรอก longitude');
        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(', ') });
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
    const errors = [];

    //ดึงค่า DisasterType จาก enum
    const allowedDisasterTypes = Object.values(DisasterType)
    
    if (!regionId) errors.push('กรุณากรอก regisionId')
    if (!disasterType || !allowedDisasterTypes.includes(disasterType)) {
        errors.push('กรุณากรอก disasterType')
    }
    if (threshold === undefined) errors.push('กรุณากรอก threshold')

    // ถ้ามี error ให้ส่งกลับ
    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') })
    }
try {
    //สร้าง alert setting เข้าdb
    const  setting = await prisma.alertSetting.create({
        data: {
            regionId: Number(regionId),
            disasterType,
            threshold: Number(threshold)
        }
    })
    res.status(201).json(setting)
} catch (error) {
    console.error('Error adding alert settings:',error)
    res.status(500).json({message: 'เกิดข้อผิดพลาดในการเพิ่ม alert settings'})
}
}