//
// OhanaChica: Moyo F., Suhana K., Jessica Y., Michelle Z.
//  SoftDev
//  P05: Astrology
//  2025-06-06
//  Time Spent: ???? hours
//

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        zodiac TEXT,
        birthday TEXT
        )`
    );

    // Astrology info table
    db.run(`CREATE TABLE IF NOT EXISTS astrology_info (
        sign TEXT PRIMARY KEY,
        compatibility TEXT,
        personalityTraits TEXT,
        advice TEXT
    )`)

});

module.exports = db;
