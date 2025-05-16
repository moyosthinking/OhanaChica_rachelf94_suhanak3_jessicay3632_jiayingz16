//
// OhanaChica: Moyo F., Suhana K., Jessica Y., Michelle Z.
//  SoftDev
//  P05: Astrology
//  2025-06-06
//  Time Spent: ???? hours
//

var request = require('request');
const keys = require('./keys/api_keys');

var options = {
    'method': 'POST',
    'url': 'https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/sun',
    'headers': {
    'Authorization': `Bearer ${keys.AUTH_TOKEN}`
  },
  formData: {
    'api_key': keys.API_KEY,
    'full_name': 'Rahul Kumar',
    'day': '24',
    'month': '05',
    'year': '2023',
    'hour': '14',
    'min': '40',
    'sec': '43',
    'gender': 'male',
    'place': 'New Delhi, India',
    'lat': '28.7041',
    'lon': '77.1025',
    'tzone': '5.5',
    'lan': 'en',
    'house_system': 'P'
  }
};

// Export a function to get the astrology data
function getAstrologyData(callback) {
  request(options, function (error, response) {
    if (error) {
      return callback(error);
    }

    try {
      const data = JSON.parse(response.body);
      callback(null, data);
    } catch (parseError) {
      callback(parseError);
    }
  });
}

// If this file is run directly, execute the API call
if (require.main === module) {
  getAstrologyData((error, data) => {
    if (error) {
      console.error('Error:', error.message);
      return;
    }
    console.log(JSON.stringify(data, null, 2));

    // Save data to file
    const fs = require('fs');
    fs.writeFileSync('./astrology-data.json', JSON.stringify(data, null, 2));
    console.log('Data saved to astrology-data.json');
  });
}

module.exports = {
  getAstrologyData
};
