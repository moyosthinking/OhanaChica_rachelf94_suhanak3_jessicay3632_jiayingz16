const request = require('request');
const fs = require('fs');
const path = require('path');
const keys = require('./keys/api_keys');

// Create dataset directory if it doesn't exist
const datasetDir = path.join(__dirname, 'dataset');
if (!fs.existsSync(datasetDir)) {
  fs.mkdirSync(datasetDir, { recursive: true });
}

// Sample names for dataset generation
const names = [
  'Emma Thompson', 'James Wilson', 'Sophia Martinez', 'Michael Johnson',
  'Olivia Lee', 'William Davis', 'Ava Rodriguez', 'Alexander Brown',
  'Isabella Taylor', 'Daniel Anderson', 'Charlotte Thomas', 'David White',
  'Mia Harris', 'Joseph Martin', 'Amelia Garcia', 'John Jackson',
  'Harper Lewis', 'Christopher Clark', 'Evelyn Walker', 'Matthew Hall'
];

// Different locations with lat/long
const locations = [
  { place: 'New York, USA', lat: '40.7128', lon: '-74.0060', tzone: '-5.0' },
  { place: 'Los Angeles, USA', lat: '34.0522', lon: '-118.2437', tzone: '-8.0' },
  { place: 'Chicago, USA', lat: '41.8781', lon: '-87.6298', tzone: '-6.0' },
  { place: 'London, UK', lat: '51.5074', lon: '-0.1278', tzone: '0.0' },
  { place: 'Tokyo, Japan', lat: '35.6762', lon: '139.6503', tzone: '9.0' },
  { place: 'Sydney, Australia', lat: '-33.8688', lon: '151.2093', tzone: '10.0' },
  { place: 'Paris, France', lat: '48.8566', lon: '2.3522', tzone: '1.0' },
  { place: 'Berlin, Germany', lat: '52.5200', lon: '13.4050', tzone: '1.0' },
  { place: 'Mumbai, India', lat: '19.0760', lon: '72.8777', tzone: '5.5' },
  { place: 'Cairo, Egypt', lat: '30.0444', lon: '31.2357', tzone: '2.0' }
];

// Variety of birth years (1950-2010)
function getRandomYear() {
  return Math.floor(Math.random() * (2010 - 1950 + 1)) + 1950;
}

// Random month (1-12)
function getRandomMonth() {
  return Math.floor(Math.random() * 12) + 1;
}

// Random day (1-28 to keep it simple)
function getRandomDay() {
  return Math.floor(Math.random() * 28) + 1;
}

// Random hour (0-23)
function getRandomHour() {
  return Math.floor(Math.random() * 24);
}

// Random minute (0-59)
function getRandomMinute() {
  return Math.floor(Math.random() * 60);
}

// Astrological aspects to query (sun, moon, rising, etc.)
const aspects = [
  'sun', 'moon', 'rising'
//   'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
];

// Generate a random profile
function generateRandomProfile() {
  const location = locations[Math.floor(Math.random() * locations.length)];
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  
  return {
    full_name: names[Math.floor(Math.random() * names.length)],
    day: getRandomDay().toString().padStart(2, '0'),
    month: getRandomMonth().toString().padStart(2, '0'),
    year: getRandomYear().toString(),
    hour: getRandomHour().toString().padStart(2, '0'),
    min: getRandomMinute().toString().padStart(2, '0'),
    sec: '00',
    gender: gender,
    place: location.place,
    lat: location.lat,
    lon: location.lon,
    tzone: location.tzone,
    lan: 'en',
    house_system: 'P'
  };
}

// Function to make API request for general sign report with a specific profile and aspect
function makeAstrologyRequest(profile, aspect) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'POST',
      'url': `https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/${aspect}`,
      'headers': {
        'Authorization': `Bearer ${keys.AUTH_TOKEN}`
      },
      formData: {
        'api_key': keys.API_KEY,
        ...profile
      }
    };
    
    request(options, function(error, response) {
      if (error) {
        return reject(error);
      }
      
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// Function to make API request for general sign report (without aspect)
function makeGeneralSignReportRequest(profile) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'POST',
      'url': 'https://astroapi-4.divineapi.com/western-api/v1/general-sign-report/',
      'headers': {
        'Authorization': `Bearer ${keys.AUTH_TOKEN}`
      },
      formData: {
        'api_key': keys.API_KEY,
        ...profile
      }
    };
    
    request(options, function(error, response) {
      if (error) {
        return reject(error);
      }
      
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// Function to make API request for physical compatibility between two profiles
function makePhysicalCompatibilityRequest(profile1, profile2) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'POST',
      'url': 'https://astroapi-4.divineapi.com/western-api/v2/synastry/physical-compatibility',
      'headers': {
        'Authorization': `Bearer ${keys.AUTH_TOKEN}`
      },
      formData: {
        'api_key': keys.API_KEY,
        'p1_full_name': profile1.full_name,
        'p1_day': profile1.day,
        'p1_month': profile1.month,
        'p1_year': profile1.year,
        'p1_hour': profile1.hour,
        'p1_min': profile1.min,
        'p1_sec': profile1.sec,
        'p1_gender': profile1.gender,
        'p1_place': profile1.place,
        'p1_lat': profile1.lat,
        'p1_lon': profile1.lon,
        'p1_tzone': profile1.tzone,
        'p2_full_name': profile2.full_name,
        'p2_day': profile2.day,
        'p2_month': profile2.month,
        'p2_year': profile2.year,
        'p2_hour': profile2.hour,
        'p2_min': profile2.min,
        'p2_sec': profile2.sec,
        'p2_gender': profile2.gender,
        'p2_place': profile2.place,
        'p2_lat': profile2.lat,
        'p2_lon': profile2.lon,
        'p2_tzone': profile2.tzone,
        'lan': 'en'
      }
    };
    
    request(options, function(error, response) {
      if (error) {
        return reject(error);
      }
      
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// Function to make API request for sexual compatibility between two profiles
function makeSexualCompatibilityRequest(profile1, profile2) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'POST',
      'url': 'https://astroapi-4.divineapi.com/western-api/v2/synastry/sexual-compatibility',
      'headers': {
        'Authorization': `Bearer ${keys.AUTH_TOKEN}`
      },
      formData: {
        'api_key': keys.API_KEY,
        'p1_full_name': profile1.full_name,
        'p1_day': profile1.day,
        'p1_month': profile1.month,
        'p1_year': profile1.year,
        'p1_hour': profile1.hour,
        'p1_min': profile1.min,
        'p1_sec': profile1.sec,
        'p1_gender': profile1.gender,
        'p1_place': profile1.place,
        'p1_lat': profile1.lat,
        'p1_lon': profile1.lon,
        'p1_tzone': profile1.tzone,
        'p2_full_name': profile2.full_name,
        'p2_day': profile2.day,
        'p2_month': profile2.month,
        'p2_year': profile2.year,
        'p2_hour': profile2.hour,
        'p2_min': profile2.min,
        'p2_sec': profile2.sec,
        'p2_gender': profile2.gender,
        'p2_place': profile2.place,
        'p2_lat': profile2.lat,
        'p2_lon': profile2.lon,
        'p2_tzone': profile2.tzone,
        'lan': 'en'
      }
    };
    
    request(options, function(error, response) {
      if (error) {
        return reject(error);
      }
      
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// Main function to generate the dataset
async function generateDataset() {
  console.log('Starting dataset generation...');
  
  // Number of profiles to generate
  const numProfiles = 5;
  
  // Generate all profiles first
  const profiles = [];
  for (let i = 0; i < numProfiles; i++) {
    profiles.push(generateRandomProfile());
  }
  
  // Final dataset
  const dataset = {
    profiles: [],
    compatibility: [],
    generated: new Date().toISOString(),
    total_entries: 0
  };
  
  // For each profile, query all aspects and general report
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    console.log(`Generating data for profile ${i+1}/${numProfiles}: ${profile.full_name}`);
    
    const profileData = {
      person: {
        name: profile.full_name,
        birthdate: `${profile.year}-${profile.month}-${profile.day}`,
        birthtime: `${profile.hour}:${profile.min}:${profile.sec}`,
        location: profile.place,
        gender: profile.gender
      },
      aspects: {},
      general_report: {}
    };
    
    // 1. Get general sign report (without aspect)
    try {
      console.log(`  Fetching general sign report...`);
      const generalData = await makeGeneralSignReportRequest(profile);
      
      if (generalData && generalData.status === 'success') {
        profileData.general_report = generalData;
        
        // Save general report file
        const generalFileName = `${profile.full_name.replace(/\s+/g, '_')}_general_report.json`;
        fs.writeFileSync(
          path.join(datasetDir, generalFileName),
          JSON.stringify(generalData, null, 2)
        );
      } else {
        console.log(`  ❌ Error fetching general sign report:`, generalData.message || 'Unknown error');
      }
      
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Error with general sign report request:`, error.message);
    }
    
    // 2. Get aspect-specific reports
    for (const aspect of aspects) {
      try {
        console.log(`  Fetching ${aspect} data...`);
        const data = await makeAstrologyRequest(profile, aspect);
        
        if (data && data.status === 'success') {
          profileData.aspects[aspect] = data;
          
          // Save individual aspect file
          const aspectFileName = `${profile.full_name.replace(/\s+/g, '_')}_${aspect}.json`;
          fs.writeFileSync(
            path.join(datasetDir, aspectFileName),
            JSON.stringify(data, null, 2)
          );
        } else {
          console.log(`  ❌ Error fetching ${aspect} data:`, data.message || 'Unknown error');
        }
        
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ❌ Error with ${aspect} request:`, error.message);
      }
    }
    
    dataset.profiles.push(profileData);
    dataset.total_entries++;
    
    // Save progress after each profile
    fs.writeFileSync(
      path.join(__dirname, 'astrology-data.json'),
      JSON.stringify(dataset, null, 2)
    );
    
    console.log(`Completed profile ${i+1}/${numProfiles}`);
  }
  
  // 3. Generate compatibility data between profiles
  console.log('\nGenerating compatibility data between profiles...');
  
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const profile1 = profiles[i];
      const profile2 = profiles[j];
      
      console.log(`Generating compatibility data between ${profile1.full_name} and ${profile2.full_name}`);
      
      const compatibilityData = {
        person1: {
          name: profile1.full_name,
          birthdate: `${profile1.year}-${profile1.month}-${profile1.day}`,
          birthtime: `${profile1.hour}:${profile1.min}:${profile1.sec}`,
          location: profile1.place,
          gender: profile1.gender
        },
        person2: {
          name: profile2.full_name,
          birthdate: `${profile2.year}-${profile2.month}-${profile2.day}`,
          birthtime: `${profile2.hour}:${profile2.min}:${profile2.sec}`,
          location: profile2.place,
          gender: profile2.gender
        },
        physical_compatibility: {},
        sexual_compatibility: {}
      };
      
      // Physical compatibility
      try {
        console.log(`  Fetching physical compatibility data...`);
        const physicalData = await makePhysicalCompatibilityRequest(profile1, profile2);
        
        if (physicalData && physicalData.status === 'success') {
          compatibilityData.physical_compatibility = physicalData;
          
          // Save physical compatibility file
          const physicalFileName = `${profile1.full_name.replace(/\s+/g, '_')}_${profile2.full_name.replace(/\s+/g, '_')}_physical.json`;
          fs.writeFileSync(
            path.join(datasetDir, physicalFileName),
            JSON.stringify(physicalData, null, 2)
          );
        } else {
          console.log(`  ❌ Error fetching physical compatibility data:`, physicalData.message || 'Unknown error');
        }
        
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ❌ Error with physical compatibility request:`, error.message);
      }
      
      // Sexual compatibility
      try {
        console.log(`  Fetching sexual compatibility data...`);
        const sexualData = await makeSexualCompatibilityRequest(profile1, profile2);
        
        if (sexualData && sexualData.status === 'success') {
          compatibilityData.sexual_compatibility = sexualData;
          
          // Save sexual compatibility file
          const sexualFileName = `${profile1.full_name.replace(/\s+/g, '_')}_${profile2.full_name.replace(/\s+/g, '_')}_sexual.json`;
          fs.writeFileSync(
            path.join(datasetDir, sexualFileName),
            JSON.stringify(sexualData, null, 2)
          );
        } else {
          console.log(`  ❌ Error fetching sexual compatibility data:`, sexualData.message || 'Unknown error');
        }
        
        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ❌ Error with sexual compatibility request:`, error.message);
      }
      
      dataset.compatibility.push(compatibilityData);
      
      // Save progress after each compatibility pair
      fs.writeFileSync(
        path.join(__dirname, 'astrology-data.json'),
        JSON.stringify(dataset, null, 2)
      );
    }
  }
  
  console.log('\nDataset generation complete!');
  console.log(`Generated data for ${dataset.total_entries} profiles across ${aspects.length} astrological aspects`);
  console.log(`Generated compatibility data for ${dataset.compatibility.length} profile pairs`);
  console.log(`Full dataset saved to ${path.join(__dirname, 'astrology-data.json')}`);
  console.log(`Individual files saved in ${datasetDir}`);
}

// Run the dataset generation
generateDataset().catch(error => {
  console.error('Error generating dataset:', error);
}); 