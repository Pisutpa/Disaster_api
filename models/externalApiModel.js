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
      try {
        const response = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
          params: {
            format: 'geojson',
            limit: 1,
            orderby: 'time',
            minlatitude: region.minLat,
            maxlatitude: region.maxLat,
            minlongitude: region.minLon,
            maxlongitude: region.maxLon,
          }
        });

        if (response.data?.features?.length > 0) {
          const quake = response.data.features[0];
          const magnitude = quake.properties.mag || 0;
          const place = quake.properties.place || 'Unknown';

          const timeUTC = quake.properties.time ? new Date(quake.properties.time) : null;

          if (timeUTC) {
            const timeInBangkok = new Date(timeUTC.getTime() + 7 * 60 * 60 * 1000); // +7 ชั่วโมง
            const formattedTime = timeInBangkok.toISOString().replace('T', ' ').substring(0, 19);
            console.log('เวลาประเทศไทย:', formattedTime);

            return {
              magnitude: magnitude.toFixed(2),
              place,
              time: formattedTime  // ✅ ส่งค่าที่แปลงแล้วกลับไป
            };
          } else {
            return {
              magnitude: magnitude.toFixed(2),
              place,
              time: null
            };
          }
        } else {
          return {};
        }

      } catch (error) {
        console.error('Error fetching earthquake data:', error);
        return {};
      }
    }

    case DisasterType.wildfire: {
      try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: region.latitude,
            longitude: region.latitude,
            hourly: 'temperature_2m,relative_humidity_2m',
            timezone: 'Asia/Bangkok',
          }
        })
        const hourly = response.data?.hourly
        const temperatures = hourly.temperature_2m || []
        const humidities = hourly?.relative_humidity_2m || []
        const avgTemp = temperatures.length
          ? temperatures.reduce((sum, val) => sum + val, 0) / temperatures.length
          : 0;

        const avgHumidity = humidities.length
          ? humidities.reduce((sum, val) => sum + val, 0) / humidities.length
          : 0;

        return {
          temperature: parseFloat(avgTemp.toFixed(2)),
          humidity: parseFloat(avgHumidity.toFixed(2)),
        };
      } catch (error) {
        console.error('Error fetching widfire data', error)
        return {}
      }
    }
    default:
      console.warn(`Unknown disaster type: ${disasterType}`)
      return {}
  }
}






