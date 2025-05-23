const fs = require('fs');

// Read the sign reports and compatibility data
const sign_reports = fs.readFileSync('dataset/sign-reports.json', 'utf8');
const compatibility_data = fs.readFileSync('dataset/compatibility-data.json', 'utf8');

// Parse the JSON data
const sign_reports_data = JSON.parse(sign_reports);
const compatibility_data_data = JSON.parse(compatibility_data);

console.log(sign_reports_data)
console.log(compatibility_data_data)