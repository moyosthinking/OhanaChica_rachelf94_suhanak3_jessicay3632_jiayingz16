const fs = require('fs');

// Test function to check if the API call is successful using fetch
async function testAstrologyAPIFetch() {
  console.log('Testing astrology API connection using fetch...');
  
  // Prepare form data
  const formData = new URLSearchParams();
  formData.append('api_key', '1081c67cef0e0bc1059b7e10902d2656');
  formData.append('full_name', 'Test User');
  formData.append('day', '15');
  formData.append('month', '06');
  formData.append('year', '1990');
  formData.append('hour', '12');
  formData.append('min', '30');
  formData.append('sec', '00');
  formData.append('gender', 'male');
  formData.append('place', 'New York, USA');
  formData.append('lat', '40.7128');
  formData.append('lon', '-74.0060');
  formData.append('tzone', '-5.0');
  formData.append('lan', 'en');
  formData.append('house_system', 'P');
  
  try {
    const response = await fetch('https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/sun', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer {Your Auth Token}',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    // Check HTTP status
    if (!response.ok) {
      console.log(`❌ HTTP error! Status: ${response.status}`);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    // Try to parse JSON
    try {
      const data = await response.json();
      
      // Check if the API returned a success status
      if (data.status && data.status === 'success') {
        console.log('✅ API call successful!');
        console.log('Response status:', data.status);
        console.log('Response code:', response.status);
        
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
        fs.writeFileSync('./api-response-fetch.json', JSON.stringify(data, null, 2));
        console.log('\nFull response saved to api-response-fetch.json');
      } else {
        console.log('❌ API call returned an error:');
        console.log(data);
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError.message);
      const rawText = await response.text();
      console.log('Raw response:', rawText);
    }
  } catch (fetchError) {
    console.error('Fetch error:', fetchError.message);
  }
}

// Run the test
testAstrologyAPIFetch(); 