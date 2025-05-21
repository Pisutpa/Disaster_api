const { PrismaClient } = require('@prisma/client');
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
            data:{
                name,
                latitude:parseFloat(latitude),
                longitude: parseFloat(longitude)
            }
        })
        res.status(201).json({ message: 'เพิ่ม region สำเร็จ', 
            data: newRegion,
        })
    } catch (error) {
        console.error('Error adding region:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่ม region' })
    }
}