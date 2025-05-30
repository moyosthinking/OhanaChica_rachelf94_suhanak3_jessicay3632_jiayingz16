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
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
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
      const errorMessage = encodeURIComponent('Username already exists. Please try a different username.');
      res.redirect(`/register?error=${errorMessage}`);
    } else {
      console.log(`User registered successfully with ID: ${userId}`);
      const successMessage = encodeURIComponent('Registration successful! Please log in.');
      res.redirect(`/login?success=${successMessage}`);
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  user.authenticateUser(username, password, (err, userObj) => {
    if (err) {
      const errorMessage = encodeURIComponent('Login error occurred.');
      res.redirect(`/login?error=${errorMessage}`);
    } else if (userObj) {
      req.session.user = userObj.username;
      res.redirect('/');
      console.log(`User logged in successfully with username: ${username}`);
      loggedIn = true;
    } else {
      const errorMessage = encodeURIComponent('Invalid credentials.');
      res.redirect(`/login?error=${errorMessage}`);
    }
  });
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/logout', (req, res) => {
  res.redirect('/');
});

//chattting

app.get('/chat', (req, res) => {
  if (req.isAuthenticated())
    {
      res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    }
  else{
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  }
});

app.get('/compat', (req, res) => {
  if (req.isAuthenticated())
    {
      res.sendFile(path.join(__dirname, 'public', 'compatibility.html'));
    }
  else{
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  }
});

app.get('/horoscope', (req, res) => {
  if (req.isAuthenticated())
    {
      res.sendFile(path.join(__dirname, 'public', 'horoscope.html'));
    }
  else{
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  }
});

app.get('/self', (req, res) => {
  if (req.isAuthenticated())
    {
      res.sendFile(path.join(__dirname, 'public', 'selfimprov.html'));
    }
  else{
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
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
