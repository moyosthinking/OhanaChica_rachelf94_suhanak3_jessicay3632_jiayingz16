const db = require('./db');
const bcrypt = require('bcrypt');

function createUser(username, password, birthday, callback) {
    console.log(`Attempting to create user: ${username} with birthday: ${birthday}`);
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return callback(err);
        }
        console.log('Password hashed successfully');
        db.run(`INSERT INTO users (username, password, birthday) VALUES (?, ?, ?)`, [username, hash, birthday], function(err) {
            if (err) {
                console.error('Error inserting user:', err);
            } else {
                console.log(`User created with ID: ${this ? this.lastID : 'unknown'}`);
            }
            callback(err, this ? this.lastID : null);
        });
    });
}

function authenticateUser(username, password, callback) {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(null, false);
        bcrypt.compare(password, user.password, (err, res) => {
            if (err) return callback(err);
            if (res) {
                callback(null, user);
            } else {
                callback(null, false);
            }
        });
    });
}

module.exports = {
    createUser,
    authenticateUser
}