  // OhanaChica: Moyo F., Suhana K., Jessica Y., Michelle Z.
  // SoftDev
  // P05: Astrology
  // 2025-06-06
  // Time Spent: ~8 hours

const request = require('request');
const fs = require('fs');
const path = require('path');
const keys = require('./keys/api_keys'); // Assuming you have this file with AUTH_TOKEN and API_KEY

// Create dataset directory if it doesn't exist
const datasetDir = path.join(__dirname, 'dataset');

// Create dataset file if it doesn't exist
if (!fs.existsSync(datasetDir)) {
  fs.mkdirSync(datasetDir, { recursive: true });
}

// Sample names for dataset generation
const names = [
  'Michelle Zhu', 'Andrew Choi', 'Suhana Khan', 'Moyo Fakudze', 'Jessica Yoo',
];

// Different locations with lat/long
const locations = [
    { place: 'Baker Island',        lat: '0.1936',    lon: '-176.4769',  tzone: '-12'  }, // UTC-12:00
    { place: 'American Samoa',      lat: '-14.2710',  lon: '-170.1322',  tzone: '-11'  }, // UTC-11:00
    { place: 'Honolulu',            lat: '21.3069',   lon: '-157.8583',  tzone: '-10'  }, // UTC-10:00
    { place: 'Anchorage',           lat: '61.2181',   lon: '-149.9003',  tzone: '-9'   }, // UTC-09:00
    { place: 'Los Angeles',         lat: '34.0522',   lon: '-118.2437',  tzone: '-8'   }, // UTC-08:00
    { place: 'Denver',              lat: '39.7392',   lon: '-104.9903',  tzone: '-7'   }, // UTC-07:00
    { place: 'Chicago',             lat: '41.8781',   lon: '-87.6298',   tzone: '-6'   }, // UTC-06:00
    { place: 'New York',            lat: '40.7128',   lon: '-74.0060',   tzone: '-5'   }, // UTC-05:00
    { place: 'Caracas',             lat: '10.4806',   lon: '-66.9036',   tzone: '-4'   }, // UTC-04:00
    { place: 'Rio de Janeiro',      lat: '-22.9068',  lon: '-43.1729',   tzone: '-3'   }, // UTC-03:00
    { place: 'Azores',              lat: '37.7412',   lon: '-25.6756',   tzone: '-1'   }, // UTC-01:00
    { place: 'London',              lat: '51.5074',   lon: '-0.1278',    tzone: '0'    }, // UTC+00:00
    { place: 'Berlin',              lat: '52.5200',   lon: '13.4050',     tzone: '1'    }, // UTC+01:00
    { place: 'Cairo',               lat: '30.0444',   lon: '31.2357',     tzone: '2'    }, // UTC+02:00
    { place: 'Moscow',              lat: '55.7558',   lon: '37.6173',     tzone: '3'    }, // UTC+03:00
    { place: 'Tehran',              lat: '35.6892',   lon: '51.3890',     tzone: '3.5'  }, // UTC+03:30
    { place: 'Dubai',               lat: '25.2048',   lon: '55.2708',     tzone: '4'    }, // UTC+04:00
    { place: 'Kabul',               lat: '34.5553',   lon: '69.2075',     tzone: '4.5'  }, // UTC+04:30
    { place: 'Karachi',             lat: '24.8607',   lon: '67.0011',     tzone: '5'    }, // UTC+05:00
    { place: 'New Delhi',           lat: '28.6139',   lon: '77.2090',     tzone: '5.5'  }, // UTC+05:30
    { place: 'Kathmandu',           lat: '27.7172',   lon: '85.3240',     tzone: '5.75' }, // UTC+05:45
    { place: 'Dhaka',               lat: '23.8103',   lon: '90.4125',     tzone: '6'    }, // UTC+06:00
    { place: 'Yangon',              lat: '16.8409',   lon: '96.1735',     tzone: '6.5'  }, // UTC+06:30
    { place: 'Bangkok',             lat: '13.7563',   lon: '100.5018',    tzone: '7'    }, // UTC+07:00
    { place: 'Beijing',             lat: '39.9042',   lon: '116.4074',    tzone: '8'    }, // UTC+08:00
    { place: 'Tokyo',               lat: '35.6895',   lon: '139.6917',    tzone: '9'    }, // UTC+09:00
    { place: 'Adelaide',            lat: '-34.9285',  lon: '138.6007',    tzone: '9.5'  }, // UTC+09:30
    { place: 'Sydney',              lat: '-33.8688',  lon: '151.2093',    tzone: '10'   }, // UTC+10:00
    { place: 'Magadan',             lat: '59.5616',   lon: '150.8000',    tzone: '11'   }, // UTC+11:00
    { place: 'Fiji',                lat: '-17.7134',  lon: '178.0650',    tzone: '12'   }, // UTC+12:00
    { place: "Nuku'alofa",          lat: '-21.1394',  lon: '-175.2044',   tzone: '13'   }, // UTC+13:00
    { place: 'Kiritimati',          lat: '1.8721',    lon: '-157.4278',   tzone: '14'   }, // UTC+14:00
    { place: 'Reykjavik',          lat: '64.1466',   lon: '-21.9426',    tzone: '0'    }, // UTC+00:00
    { place: 'Accra',              lat: '5.6037',    lon: '-0.1870',     tzone: '0'    }, // UTC+00:00
    { place: 'Lisbon',             lat: '38.7223',   lon: '-9.1393',     tzone: '0'    }, // UTC+00:00
    { place: 'Madrid',             lat: '40.4168',   lon: '-3.7038',     tzone: '1'    }, // UTC+01:00
    { place: 'Cape Town',          lat: '-33.9249',  lon: '18.4241',     tzone: '2'    }, // UTC+02:00
    { place: 'Nairobi',            lat: '-1.2921',   lon: '36.8219',     tzone: '3'    }, // UTC+03:00
    { place: 'Baghdad',            lat: '33.3152',   lon: '44.3661',     tzone: '3'    }, // UTC+03:00
    { place: 'Ulaanbaatar',        lat: '47.8864',   lon: '106.9057',    tzone: '8'    }, // UTC+08:00
    { place: 'Vladivostok',        lat: '43.1198',   lon: '131.8869',    tzone: '10'   }, // UTC+10:00
    { place: 'Nouméa',             lat: '-22.2558',  lon: '166.4505',    tzone: '11'   }, // UTC+11:00
    { place: 'Chatham Islands',    lat: '-43.9587',  lon: '-176.5601',   tzone: '12.75'}, // UTC+12:45
    { place: 'Marquesas Islands',  lat: '-9.9000',   lon: '-139.0333',   tzone: '-9.5' }  // UTC-09:30
  ];

function getRandomName() {
    return names[Math.floor(Math.random() * names.length)];
}

function getRandomGender() {
    return Math.random() > 0.5 ? 'male' : 'female';
}

// Variety of birth years (1950-2020)
function getRandomYear() {
  return Math.floor(Math.random() * (2020 - 1950 + 1)) + 1950;
}

// Random month (1-12)
function getRandomMonth() {
  return Math.floor(Math.random() * 12) + 1;
}

// Random day (1-31 to keep it simple)
function getRandomDay() {
  return Math.floor(Math.random() * 31) + 1;
}

// Random hour (0-23)
function getRandomHour() {
  return Math.floor(Math.random() * 24);
}

// Random minute (0-59)
function getRandomMinute() {
  return Math.floor(Math.random() * 60);
}

function getRandomLocation() {
    return locations[Math.floor(Math.random() * locations.length)];
}

// Astrological aspects to query

const aspects = [
  'sun', 'moon'
];

// Generate a random profile
function generateRandomProfile() {
    const location = getRandomLocation();
    const gender = getRandomGender();
  return {
    full_name: getRandomName().toString(),
    day: getRandomDay().toString().padStart(2, '0'),
    month: getRandomMonth().toString().padStart(2, '0'),
    year: getRandomYear().toString(),
    hour: getRandomHour().toString().padStart(2, '0'),
    min: getRandomMinute().toString().padStart(2, '0'),
    sec: '00',
    gender: gender,
    place: location.place,
    lat: parseFloat(location.lat).toString(),
    lon: parseFloat(location.lon).toString(),
    tzone: parseFloat(location.tzone).toString(),
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
        'full_name': profile.full_name.toString(),
        'day': profile.day.toString(),
        'month': profile.month.toString(),
        'year': profile.year.toString(),
        'hour': profile.hour.toString(),
        'min': profile.min.toString(),
        'sec': profile.sec.toString(),
        'gender': profile.gender.toString(),
        'place': profile.place.toString(),
        'lat': profile.lat.toString(),
        'lon': profile.lon.toString(),
        'tzone': profile.tzone.toString(),
        'lan': 'en',
        'house_system': 'P'
      }
    };

    request(options, function(error, response) {
      if (error) {
        console.error(`Request error for general sign report (${aspect}): ${error.message}`);
        return reject(error);
      }
      try {
        const data = JSON.parse(response.body);
        resolve(data.data);
      } catch (parseError) {
        console.error(`JSON parse error for general sign report (${aspect}): ${parseError.message}`);
        console.error('Response body:', response.body);
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
        'p1_full_name': profile1.full_name.toString(),
        'p1_day': profile1.day.toString(),
        'p1_month': profile1.month.toString(),
        'p1_year': profile1.year.toString(),
        'p1_hour': profile1.hour.toString(),
        'p1_min': profile1.min.toString(),
        'p1_sec': profile1.sec.toString(),
        'p1_gender': profile1.gender.toString(),
        'p1_place': profile1.place.toString(),
        'p1_lat': profile1.lat.toString(),
        'p1_lon': profile1.lon.toString(),
        'p1_tzone': profile1.tzone.toString(),
        'p2_full_name': profile2.full_name.toString(),
        'p2_day': profile2.day.toString(),
        'p2_month': profile2.month.toString(),
        'p2_year': profile2.year.toString(),
        'p2_hour': profile2.hour.toString(),
        'p2_min': profile2.min.toString(),
        'p2_sec': profile2.sec.toString(),
        'p2_gender': profile2.gender.toString(),
        'p2_place': profile2.place.toString(),
        'p2_lat': profile2.lat.toString(),
        'p2_lon': profile2.lon.toString(),
        'p2_tzone': profile2.tzone.toString(),
        'lan': 'en',
        'house_system': 'P'
      }
    };

    request(options, function (error, response) {
      if (error) {
        console.error(`Request error for physical compatibility (${profile1.full_name} & ${profile2.full_name}): ${error.message}`);
        return reject(error);
      }
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        console.error(`JSON parse error for physical compatibility (${profile1.full_name} & ${profile2.full_name}): ${parseError.message}`);
        console.error('Response body:', response.body);
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
        'p1_full_name': profile1.full_name.toString(),
        'p1_day': profile1.day.toString(),
        'p1_month': profile1.month.toString(),
        'p1_year': profile1.year.toString(),
        'p1_hour': profile1.hour.toString(),
        'p1_min': profile1.min.toString(),
        'p1_sec': profile1.sec.toString(),
        'p1_gender': profile1.gender.toString(),
        'p1_place': profile1.place.toString(),
        'p1_lat': profile1.lat.toString(),
        'p1_lon': profile1.lon.toString(),
        'p1_tzone': profile1.tzone.toString(),
        'p2_full_name': profile2.full_name.toString(),
        'p2_day': profile2.day.toString(),
        'p2_month': profile2.month.toString(),
        'p2_year': profile2.year.toString(),
        'p2_hour': profile2.hour.toString(),
        'p2_min': profile2.min.toString(),
        'p2_sec': profile2.sec.toString(),
        'p2_gender': profile2.gender.toString(),
        'p2_place': profile2.place.toString(),
        'p2_lat': profile2.lat.toString(),
        'p2_lon': profile2.lon.toString(),
        'p2_tzone': profile2.tzone.toString(),
        'lan': 'en',
        'house_system': 'P'
      }
    };

    request(options, function (error, response) {
      if (error) {
        console.error(`Request error for sexual compatibility (${profile1.full_name} & ${profile2.full_name}): ${error.message}`);
        return reject(error);
      }
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        console.error(`JSON parse error for sexual compatibility (${profile1.full_name} & ${profile2.full_name}): ${parseError.message}`);
        console.error('Response body:', response.body);
        reject(parseError);
      }
    });
  });
}

// Function to make API request for emotional compatibility between two profiles
function makeEmotionalCompatibilityRequest(profile1, profile2) {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'POST',
      'url': 'https://astroapi-4.divineapi.com/western-api/v2/synastry/emotional-compatibility',
      'headers': {
        'Authorization': `Bearer ${keys.AUTH_TOKEN}`
      },
      formData: {
        'api_key': keys.API_KEY,
        'p1_full_name': profile1.full_name.toString(),
        'p1_day': profile1.day.toString(),
        'p1_month': profile1.month.toString(),
        'p1_year': profile1.year.toString(),
        'p1_hour': profile1.hour.toString(),
        'p1_min': profile1.min.toString(),
        'p1_sec': profile1.sec.toString(),
        'p1_gender': profile1.gender.toString(),
        'p1_place': profile1.place.toString(),
        'p1_lat': profile1.lat.toString(),
        'p1_lon': profile1.lon.toString(),
        'p1_tzone': profile1.tzone.toString(),
        'p2_full_name': profile2.full_name.toString(),
        'p2_day': profile2.day.toString(),
        'p2_month': profile2.month.toString(),
        'p2_year': profile2.year.toString(),
        'p2_hour': profile2.hour.toString(),
        'p2_min': profile2.min.toString(),
        'p2_sec': profile2.sec.toString(),
        'p2_gender': profile2.gender.toString(),
        'p2_place': profile2.place.toString(),
        'p2_lat': profile2.lat.toString(),
        'p2_lon': profile2.lon.toString(),
        'p2_tzone': profile2.tzone.toString(),
        'lan': 'en',
        'house_system': 'P'
      }
    };

    request(options, function (error, response) {
      if (error) {
        console.error(`Request error for emotional compatibility (${profile1.full_name} & ${profile2.full_name}): ${error.message}`);
        return reject(error);
      }
      try {
        const data = JSON.parse(response.body);
        resolve(data);
      } catch (parseError) {
        console.error(`JSON parse error for emotional compatibility (${profile1.full_name} & ${profile2.full_name}): ${parseError.message}`);
        console.error('Response body:', response.body);
        reject(parseError);
      }
    });
  });
}

// Main function to generate the dataset
async function generateDataset() {
  console.log('Starting dataset generation...');

  // Number of profiles to generate
  const numProfiles = 10000;
  
  // Load existing data if available
  let signReportsData = {
    profiles: [],
    total_entries: 0
  };
  let compatibilityData = {
    pairs: [],
    total_entries: 0
  };

  const signReportsPath = path.join(datasetDir, 'sign-reports.json');
  const compatibilityDataPath = path.join(datasetDir, 'compatibility-data.json');

  if (fs.existsSync(signReportsPath)) {
    const existingSignReports = JSON.parse(fs.readFileSync(signReportsPath, 'utf8'));
    signReportsData = existingSignReports;
    console.log(`Loaded ${signReportsData.total_entries} existing profiles`);
  }

  if (fs.existsSync(compatibilityDataPath)) {
    const existingCompatibility = JSON.parse(fs.readFileSync(compatibilityDataPath, 'utf8'));
    compatibilityData = existingCompatibility;
    console.log(`Loaded ${compatibilityData.total_entries} existing compatibility pairs`);
  }
  
  // Generate all profiles first
  const profiles = [];
  for (let i = 0; i < numProfiles; i++) {
    profiles.push(generateRandomProfile());
  }
  
  // For each profile, query all aspects and general report
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    console.log(`Processing profile ${i+1}/${numProfiles}: ${profile.full_name}`);
    
    const profileData = {
      person: {
        name: profile.full_name,
        birthdate: `${profile.year}-${profile.month}-${profile.day}`,
        birthtime: `${profile.hour}:${profile.min}:${profile.sec}`,
        location: profile.place,
        gender: profile.gender
      },
      aspects: {}
    };
    
    // 1. Get all aspect-specific reports
    for (const aspect of aspects) {
      const aspectData = await makeAstrologyRequest(profile, aspect);
      profileData.aspects[aspect] = aspectData;
      // Add a delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    signReportsData.profiles.push(profileData);
    signReportsData.total_entries++;
    
    // Save progress after each profile
    fs.writeFileSync(
      signReportsPath,
      JSON.stringify(signReportsData, null, 2)
    );
  }
  
  // Generate compatibility data between profiles
  console.log('\nGenerating compatibility data between profiles...');

  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const profile1 = profiles[i];
      const profile2 = profiles[j];

      console.log(`Processing compatibility between ${profile1.full_name} and ${profile2.full_name}`);

      const pairData = {
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
        sexual_compatibility: {},
        emotional_compatibility: {}
      };
      
      const physicalData = await makePhysicalCompatibilityRequest(profile1, profile2);
      pairData.physical_compatibility = physicalData;
      
      const sexualData = await makeSexualCompatibilityRequest(profile1, profile2);
      pairData.sexual_compatibility = sexualData;
      
      const emotionalData = await makeEmotionalCompatibilityRequest(profile1, profile2);
      pairData.emotional_compatibility = emotionalData;
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      compatibilityData.pairs.push(pairData);
      compatibilityData.total_entries++;
      
      // Save progress after each compatibility pair
      fs.writeFileSync(
        compatibilityDataPath,
        JSON.stringify(compatibilityData, null, 2)
      );
    }
  }

  console.log('\nDataset generation complete!');
  console.log(`Total profiles in dataset: ${signReportsData.total_entries}`);
  console.log(`Total compatibility pairs in dataset: ${compatibilityData.total_entries}`);
  console.log(`Sign reports saved to ${signReportsPath}`);
  console.log(`Compatibility data saved to ${compatibilityDataPath}`);
}

// Run the dataset generation
generateDataset();