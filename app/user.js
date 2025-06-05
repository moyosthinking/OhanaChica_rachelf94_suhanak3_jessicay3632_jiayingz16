const db = require('./db');
const bcrypt = require('bcrypt');

function createUser(username, password, birthday, callback) {
    console.log(`Attempting to create user: ${username} with birthday: ${birthday}`);
    bcrypt.hash(password, 10, (err, hash) => {
        db.run(`INSERT INTO users (username, password, birthday) VALUES (?, ?, ?)`, [username, hash, birthday], function(err) {
            console.log(`User created with ID: ${this ? this.lastID : 'unknown'}`);
            callback(err, this ? this.lastID : null);
        });
    });
}

function authenticateUser(username, password, callback) {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (!user) return callback(null, false);
        bcrypt.compare(password, user.password, (err, res) => {
            callback(null, res ? user : false);
        });
    });
}

function getZodiac(date) {
  const bday = new Date(date);
  const month = bday.getMonth() + 1;
  const day = bday.getDate();
  
  const zodiacs = [
    {sign: "Capricorn", startDate: [12, 22], endDate: [1, 19]},
    {sign: "Aquarius", startDate: [1, 20], endDate: [2, 18]},
    {sign: "Pisces", startDate: [2, 19], endDate: [3, 20]},
    {sign: "Aries", startDate: [3, 21], endDate: [4, 19]},
    {sign: "Taurus", startDate: [4, 20], endDate: [5, 20]},
    {sign: "Gemini", startDate: [5, 21], endDate: [6, 20]},
    {sign: "Cancer", startDate: [6, 21], endDate: [7, 22]},
    {sign: "Leo", startDate: [7, 23], endDate: [8, 22]},
    {sign: "Virgo", startDate: [8, 23], endDate: [9, 22]},
    {sign: "Libra", startDate: [9, 23], endDate: [10, 22]},
    {sign: "Scorpio", startDate: [10, 23], endDate: [11, 21]},
    {sign: "Sagittarius", startDate: [11, 22], endDate: [12, 21]}
  ];

  // Special handling for Capricorn
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return "Capricorn";
  }

  for (const zodiac of zodiacs) {
    const [startM, startD] = zodiac.startDate;
    const [endM, endD] = zodiac.endDate;
    if ((month === startM && day >= startD) || (month === endM && day <= endD)) {
      return zodiac.sign;
    }
  }
  
  return "Unknown";
}

module.exports = {
    createUser,
    authenticateUser,
    getZodiac
}
