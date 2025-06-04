//
// OhanaChica: Moyo F., Suhana K., Jessica Y., Michelle Z.
//  SoftDev
//  P05: Astrology
//  2025-06-06
//  Time Spent: ???? hours
//

const db = require('./db');
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const user = require('./user');
const http =  require('http');
const WebSocket =  require('ws');
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
      req.session.userId = userObj.id;
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
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    } else {
      res.redirect('/');
      console.log(`no profile! user not logged in`);
    }
  });
});

app.get('/data', (req, res) => {
  const userId = req.session.userId;
  db.get('SELECT id, username, birthday FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Sending user data:', row);
    res.json(row);
  });
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
      console.log(`no self improvment! user not logged in`);
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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/chat' });

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

app.get('/username', (req, res) => {
  res.json({ username: req.session.user });
});

wss.on('connection', (ws) => {
  console.log('User connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('User disconnected');
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
