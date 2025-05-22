const axios = require('axios')

const DisasterType = {
  flood: 'flood',
  earthquake: 'earthquake',
  wildfire: 'wildfire',
}

exports.getDisasterRisk = async (region, disasterType) => {
  console.log(`Fetching disaster risk for region: ${region.name}, type: ${disasterType}`)

  // แปลง disasterType ให้เป็นตัวพิมพ์เล็ก เพื่อให้ตรงกับ enum
  const type = disasterType.toLowerCase()

  switch (type) {
    case DisasterType.flood: {
      try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: region.latitude,
            longitude: region.longitude,
            daily: 'precipitation_sum',
            timezone: 'Asia/Bangkok',
          }
        })

        const daily = response.data?.daily
        const precipitationArray = daily?.precipitation_sum

        const rainfall = Array.isArray(precipitationArray) && precipitationArray.length > 0
          ? precipitationArray.reduce((sum, val) => sum + val, 0) / precipitationArray.length
          : 0

    
        return { rainfall: rainfall.toFixed(2) };

      } catch (error) {
        console.error('Error fetching flood data:', error)
        return {}
      }
    }
    case DisasterType.earthquake: {
      // ตัวอย่างข้อมูลสมมติ
      return { magnitude: 5.5 }
    }
    case DisasterType.wildfire: {
      // ตัวอย่างข้อมูลสมมติ
      return { temperature: 35, humidity: 40 }
    }
    default:
      console.warn(`Unknown disaster type: ${disasterType}`)
      return {}
  }
}






