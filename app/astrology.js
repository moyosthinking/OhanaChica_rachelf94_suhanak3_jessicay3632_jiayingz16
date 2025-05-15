var request = require('request');
var options = {
    'method': 'POST',
    'url': 'https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/sun',
    'headers': {
    'Authorization': 'Bearer {Your Auth Token}'
  },
  formData: {
    'api_key': '{Your API Key}',
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
    'tzone': '5.5'
    'lan': 'en',
    'house_system': 'P'
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});