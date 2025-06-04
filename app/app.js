//
// OhanaChica: Moyo F., Suhana K., Jessica Y., Michelle Z.
//  SoftDev
//  P05: Astrology
//  2025-06-06
//  Time Spent: ???? hours
//

const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const user = require('./user');
const http =  require('http');
const WebSocket =  require('ws');
const fs = require('fs');
const db = require('./db');
const app = express();
const port = 3000;
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

var loggedIn = false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'ohana-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Serve login and register HTML
app.get('/login', (req, res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (!req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } else {
      res.redirect('/');
      console.log(`user already logged in`);
    }
  });
});

app.get('/register', (req, res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (!req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'register.html'));
    } else {
      res.redirect('/');
      console.log(`user already registered`);
    }
  });
});

// Registration endpoint
app.post('/register', (req, res) => {
  const { username, password, birthday } = req.body;
  console.log(`Registration attempt: username=${username}, birthday=${birthday}`);

  user.createUser(username, password, birthday, (err, userId) => {
    if (err) {
      console.error('Registration error:', err.message);
      res.send('<p>Registration failed. Username may already exist.</p><a href="/register.html">Try again</a>');
    } else {
      console.log(`User registered successfully with ID: ${userId}`);
      res.redirect('/login');
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (err) {
      res.send('<p>Login error occurred.</p><a href="/login.html">Try again</a>');
    } else if (userObj) {
      req.session.user = userObj.username;
      res.redirect('/');
      console.log(`User logged in successfully with username: ${username}`);
    } else {
      res.send('<p>Invalid credentials.</p><a href="/login.html">Try again</a>');
    }
  });
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/profile', (req,res) => {
  if (req.session.user) {
    // Get user data from database
    db.get('SELECT username, birthday FROM users WHERE username = ?', [req.session.user], (err, userData) => {
      if (err) {
        console.error('Error fetching user data:', err);
        res.redirect('/');
        return;
      }
      
      // Read the profile template
      fs.readFile(path.join(__dirname, 'public', 'profile.html'), 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading profile template:', err);
          res.redirect('/');
          return;
        }

        // Replace placeholders with actual data
        const profileHtml = data
          .replace('{ username }', userData.username || '')
          .replace('{ birthday }', userData.birthday || '')
          .replace('{ zodiac }', getZodiacSign(userData.birthday) || '')
        res.send(profileHtml);
      });
    });
  } else {
    res.redirect('/');
    console.log(`no profile! user not logged in`);
  }
});

app.get('/compat', (req,res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'compatibility.html'));
    } else {
      res.redirect('/');
      console.log(`no compatibility! user not logged in`);
    }
  });
});

app.get('/self', (req,res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'selfimprov.html'));
    } else {
      res.redirect('/');
      console.log(`no selfimprovment! user not logged in`);
    }
  });
});

app.post('/get-compatibility', async (req, res) => {
  const { sign1, sign2 } = req.body;

  try {
    const response = await axios.post('http://localhost:5000/get-compatibility', {
      sign1, sign2
    });

    res.json({ suggestion: response.data.suggestion });
  } catch (error) {
    console.error('Compatibility AI error:', error.message);
    res.status(500).json({ error: 'Failed to get compatibility advice.' });
  }
});

app.post('/get-self-improvement', async (req, res) => {
  const { birthday, birthtime, location, gender } = req.body;

  try {
    const response = await axios.post('http://localhost:5000/get-self-improvement', {
      birthday, birthtime, location, gender
    });

    res.json({ suggestion: response.data.suggestion });
  } catch (error) {
    console.error('Self-improvement AI error:', error.message);
    res.status(500).json({ error: 'Failed to get self-improvement advice.' });
  }
});

app.get('/horoscope', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'horoscopes.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    else {
      console.log('user successfully logged out');
    }
  });
  res.redirect('/');
});

//chattting

app.get('/chat', (req, res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'chat.html'));
      console.log(`logged in user can chat`);
    } else {
      res.redirect('/');
      console.log(`no chatting! user not logged in`);
    }
  });
});

// Add endpoint to update profile picture
app.post('/update-profile-picture', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }

  const { profilePicture } = req.body;
  
  db.run('UPDATE users SET profile_picture = ? WHERE username = ?', 
    [profilePicture, req.session.user], 
    (err) => {
      if (err) {
        console.error('Error updating profile picture:', err);
        res.status(500).json({ error: 'Failed to update profile picture' });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Helper function to get zodiac sign from birthday
function getZodiacSign(birthday) {
  if (!birthday) return '';
  const date = new Date(birthday);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

// Helper function to get zodiac date range
function getZodiacDateRange(birthday) {
  if (!birthday) return '';
  const sign = getZodiacSign(birthday);
  const ranges = {
    'Aries': 'March 21 - April 19',
    'Taurus': 'April 20 - May 20',
    'Gemini': 'May 21 - June 20',
    'Cancer': 'June 21 - July 22',
    'Leo': 'July 23 - August 22',
    'Virgo': 'August 23 - September 22',
    'Libra': 'September 23 - October 22',
    'Scorpio': 'October 23 - November 21',
    'Sagittarius': 'November 22 - December 21',
    'Capricorn': 'December 22 - January 19',
    'Aquarius': 'January 20 - February 18',
    'Pisces': 'February 19 - March 20'
  };
  return ranges[sign] || '';
}

const server = http.createServer(app);
const wss =  new WebSocket.Server({ server });
let id = 0;

wss.on('connection', (ws) => {
  console.log('Websocket: new user connection');
  ws.username = `Astrologist${id++}`;

  ws.on('message', (message) => {
    const msgStr = message.toString();
    const full = JSON.stringify({
      user: ws.username,
      message: msgStr
    });
    wss.clients.forEach(client =>
    {
      if (client.readyState === WebSocket.OPEN) {
        client.send(full);
      }
    }
    );
  });
  ws.on('close', () =>
  {
    console.log('Websocket : user disconnected');
  });
});

// Proxy API calls from Node.js → Python Flask
app.use('/get-compatibility', createProxyMiddleware({ 
  target: 'http://localhost:5000', 
  changeOrigin: true 
}));

app.use('/get-self-improvement', createProxyMiddleware({ 
  target: 'http://localhost:5000', 
  changeOrigin: true 
}));


//starts server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
