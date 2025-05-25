
# Disaster Prediction and Alert System API

API สำหรับประเมินความเสี่ยงภัยพิบัติและส่งการแจ้งเตือนผ่านอีเมล โดยใช้ Node.js, Express, Prisma, Redis, และ SendGrid

---

## Dependencies

- [@prisma/client](https://www.npmjs.com/package/@prisma/client) - ORM สำหรับเชื่อมต่อฐานข้อมูล
- [@sendgrid/mail](https://www.npmjs.com/package/@sendgrid/mail) - ส่งอีเมลผ่าน SendGrid API
- [axios](https://www.npmjs.com/package/axios) - HTTP client สำหรับดึงข้อมูลจาก API ภายนอก
- [date-fns](https://www.npmjs.com/package/date-fns) - จัดการวันที่และเวลา
- [date-fns-tz](https://www.npmjs.com/package/date-fns-tz) - จัดการ timezone ของวันที่และเวลา
- [dotenv](https://www.npmjs.com/package/dotenv) - โหลด environment variables จากไฟล์ `.env`
- [express](https://www.npmjs.com/package/express) - เว็บเฟรมเวิร์คสำหรับสร้าง API
- [ioredis](https://www.npmjs.com/package/ioredis) - Redis client
- [morgan](https://www.npmjs.com/package/morgan) - Logger สำหรับ Express
- [winston](https://www.npmjs.com/package/winston) - ระบบ logging ขั้นสูง  

---

## การติดตั้ง

1. Clone โปรเจกต์  
```bash
git clone https://github.com/your-repo/your-project.git
cd your-project
```

2. ติดตั้ง dependencies  
```bash
npm install
```

3. ตั้งค่า `.env`  
```env
DATABASE_URL=your_database_connection_string
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
REDIS_URL=your_redis_connection_string
PORT=3000
```

4. สร้างฐานข้อมูลและ Prisma client  
```bash
npx prisma migrate deploy
npx prisma generate
```

5. รันโปรเจกต์  
```bash
npm start
```

---

## API Endpoints

### 1. POST /api/regions  
**เพิ่มพื้นที่ที่ต้องการติดตาม**  

**Request Body (JSON):**  
```json
{
  "id": "region1",
  "name": "กรุงเทพมหานคร",
  "coordinates": [ /* optional, พิกัดพื้นที่ */ ]
}
```

**Response:**  
- 201 Created  
```json
{
  "message": "Region added successfully",
  "region": {
    "id": "region1",
    "name": "กรุงเทพมหานคร"
  }
}
```

---

### 2. POST /api/alert-settings  
**ตั้งค่าเกณฑ์ความเสี่ยงเพื่อแจ้งเตือน**  

**Request Body (JSON):**  
```json
{
  "disasterType": "flood",
  "threshold": {
    "riskLevel": 0.7,
    "minRainfall": 100
  },
  "active": true
}
```

**Response:**  
- 200 OK  
```json
{
  "message": "Alert settings saved",
  "settingsId": "abc123"
}
```

---

### 3. GET /api/disaster-risks  
**ประเมินความเสี่ยงภัยพิบัติทั้งหมด**  
- ใช้ Redis cache เพื่อลดการเรียก API ภายนอกซ้ำซ้อน  
- ประมวลผลรวมข้อมูลจากหลายพื้นที่และเกณฑ์ใน endpoint เดียว

**Response:**  
- 200 OK  
```json
{
  "timestamp": "2025-05-25T10:00:00Z",
  "risks": [
    {
      "regionId": "region1",
      "disasterType": "flood",
      "riskScore": 0.75,
      "alert": true
    },
    {
      "regionId": "region2",
      "disasterType": "earthquake",
      "riskScore": 0.15,
      "alert": false
    }
  ]
}
```

---

### 4. POST /alerts/create  
**สร้างข้อมูลการแจ้งเตือน (สร้าง alert ใหม่)**

**Request Body (JSON):**  
```json
{
  "regionId": "region1",
  "disasterType": "flood",
  "message": "ระดับน้ำเพิ่มสูงขึ้นในพื้นที่กรุงเทพมหานคร",
  "alertLevel": "high"
}
```

**Response:**  
- 201 Created  
```json
{
  "message": "Alert created successfully",
  "alertId": "alert123"
}
```

---

### 5. POST /api/alerts/send  
**ส่งการแจ้งเตือนแบบควบคุมรอบเวลา**  

**Request Body (JSON):**  
```json
{
  "alertId": "alert123",
  "channels": ["email", "sms"],
  "recipients": ["user1@example.com", "+66812345678"]
}
```

**Response:**  
- 200 OK  
```json
{
  "message": "Alert sent successfully",
  "alertId": "alert123"
}
```

---

### 6. GET /api/alerts  
**ดึงรายการการแจ้งเตือนทั้งหมด**

**Response:**  
- 200 OK  
```json
[
  {
    "alertId": "alert123",
    "regionId": "region1",
    "disasterType": "flood",
    "message": "ระดับน้ำเพิ่มสูงขึ้นในพื้นที่กรุงเทพมหานคร",
    "alertLevel": "high",
    "sentAt": "2025-05-25T10:30:00Z"
  },
  {
    "alertId": "alert124",
    "regionId": "region2",
    "disasterType": "earthquake",
    "message": "แผ่นดินไหวขนาด 4.5 ริกเตอร์ ในจังหวัดเชียงใหม่",
    "alertLevel": "medium",
    "sentAt": "2025-05-24T08:00:00Z"
  }
]
```

---

## การทำงานกับ Redis

- ใช้เก็บ cache ผลลัพธ์การประเมินความเสี่ยง (`/api/disaster-risks`) เพื่อลดโหลด API ภายนอกและเพิ่มความเร็วการตอบสนอง
- ใช้เป็น queue หรือ state storage สำหรับการส่งแจ้งเตือนรอบเวลา (`/api/alerts/send`)
- ป้องกันการส่งแจ้งเตือนซ้ำโดยใช้ key ใน Redis เก็บสถานะส่ง

---

## Logging

- HTTP requests: `morgan`  
- Application logs (error/info/debug): `winston`  

---
