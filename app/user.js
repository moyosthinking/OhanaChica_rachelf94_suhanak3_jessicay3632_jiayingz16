const db = require('./db');
const bcrypt = require('bcrypt');

function createUser(username, password, birthday, callback) {
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        db.run(`INSERT INTO users (username, password, birthday) VALUES (?, ?, ?)`, [username, hash, birthday], function(err) {
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