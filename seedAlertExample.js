require('dotenv').config();  // ถ้ายังไม่ได้ใส่ที่ไฟล์หลัก

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTestEmail(toEmail) {
  try {
    const msg = {
      to: toEmail,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'ทดสอบส่งเมลแจ้งเตือนภัยพิบัติ',
      text: 'นี่คือข้อความแจ้งเตือนภัยพิบัติทดสอบ',
      html: '<strong>นี่คือข้อความแจ้งเตือนภัยพิบัติทดสอบ</strong>',
    };

    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail('pisut.pa2@gmail.com');
