const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const user = require('./user');
const app = express();
const port = 4001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'ohana-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Serve login and register HTML
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/register.html', (req, res) => {
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
      res.send('<p>Registration successful! <a href="/login.html">Login here</a></p>');
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
    } else {
      res.send('<p>Invalid credentials.</p><a href="/login.html">Try again</a>');
    }
  });
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
  });
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});