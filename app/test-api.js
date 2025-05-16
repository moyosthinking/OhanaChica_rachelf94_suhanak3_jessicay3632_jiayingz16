const request = require('request');

// Test function to check if the API call is successful
function testAstrologyAPI() {
  console.log('Testing astrology API connection...');
  
  const options = {
    'method': 'POST',
    'url': 'https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/sun',
    'headers': {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RpdmluZWFwaS5jb20vc2lnbnVwIiwiaWF0IjoxNzQ3MzIyNDk2LCJuYmYiOjE3NDczMjI0OTYsImp0aSI6IkdzWmxMT3BxTTROSUt4NU4iLCJzdWIiOiIzNjY3IiwicHJ2IjoiZTZlNjRiYjBiNjEyNmQ3M2M2Yjk3YWZjM2I0NjRkOTg1ZjQ2YzlkNyJ9.F8T_rtQoPwVvFNsZ_3JACpEozAPUSaVswePrbzDWjd4'
    },
    formData: {
      'api_key': '1081c67cef0e0bc1059b7e10902d2656',
      'full_name': 'Test User',
      'day': '15',
      'month': '06',
      'year': '1990',
      'hour': '12',
      'min': '30',
      'sec': '00',
      'gender': 'male',
      'place': 'New York, USA',
      'lat': '40.7128',
      'lon': '-74.0060',
      'tzone': '-5.0',
      'lan': 'en',
      'house_system': 'P'
    }
  };
  
  request(options, function (error, response) {
    if (error) {
      console.error('API Error:', error.message);
      return;
    }
    
    try {
      // Try to parse the response as JSON
      const data = JSON.parse(response.body);
      
      // Check if the API returned a success status
      if (data.status && data.status === 'success') {
        console.log('✅ API call successful!');
        console.log('Response status:', data.status);
        console.log('Response code:', response.statusCode);
        
        // Log a summary of the data received
        console.log('\nData summary:');
        const keys = Object.keys(data);
        keys.forEach(key => {
          if (key !== 'data') {
            console.log(`- ${key}: ${typeof data[key] === 'object' ? 'Object' : data[key]}`);
          } else {
            console.log(`- ${key}: Object with ${Object.keys(data[key]).length} properties`);
          }
        });
        
        // Save the full response to a file for inspection
        const fs = require('fs');
        fs.writeFileSync('./api-response.json', JSON.stringify(data, null, 2));
        console.log('\nFull response saved to api-response.json');
      } else {
        console.log('❌ API call returned an error:');
        console.log(data);
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError.message);
      console.log('Raw response:', response.body);
    }
  });
}

// Run the test
testAstrologyAPI(); 