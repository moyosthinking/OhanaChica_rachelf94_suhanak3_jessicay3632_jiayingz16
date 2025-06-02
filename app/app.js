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
const app = express();
const port = 3000;
let loggedIn = false;

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
      res.sendFile(path.join(__dirname, 'public', 'home.html'));
      console.log(`user already logged in`);
    }
  });
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
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
      loggedIn = true;
    } else {
      res.send('<p>Invalid credentials.</p><a href="/login.html">Try again</a>');
    }
  });
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});


app.get('/compat', (req,res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'compatibility.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
    console.log(`no compatibility! user not logged in`);
  }
});

app.get('/self', (req,res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'selfimprov.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
    console.log(`no selfimprovment! user not logged in`);
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
  });
  res.redirect('/');
});

//chattting

app.get('/chat', (req,res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    console.log(`logged in user can chat`);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
    console.log(`no chatting! user not logged in`);
  }
});

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
    console.log('Websocket : user disconneted');
  });
});


//starts server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
