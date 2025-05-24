const { createLogger,format , transports} = require('winston')
const path = require('path')

//ตั้งค่า logger
const logger = createLogger({
    level : 'info', //ระดับเริ่มต้น
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf(({level, message,timestamp}) => {
            return `[${timestamp}] [&{level.toUpperCase()}]: ${message}`
        })
    ),
    transports: [
        new transports.Console(), //แสดงใน Console
        new transports.File({ filename:path.join('logs','system.log')}) //บันทึกลงไฟล์
    ]
})
module.exports = logger