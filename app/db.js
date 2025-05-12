const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER,
        username TEXT UNIQUE,
        password TEXT,
        brithday TEXT
        )`
    );

    // Astrology info table
    db.run(`CREATE TABLE IF NOT EXISTS astrology_info (
        sign TEXT PRIMARY KEY,
        date_range TEXT,
        horoscope TEXT,
        compatibility TEXT,
        personalityTraits TEXT,
        advice TEXT
    )`)

});

module.exports = db;
