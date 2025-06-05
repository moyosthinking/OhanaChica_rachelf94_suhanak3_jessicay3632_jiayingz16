//
// OhanaChica: Moyo F., Suhana K., Jessica Y., Michelle Z.
//  SoftDev
//  P05: Astrology
//  2025-06-06
//  Time Spent: ???? hours
//

require('dotenv').config();

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
// const { createProxyMiddleware } = require('http-proxy-middleware');
const { marked } = require('marked');
const { GoogleGenerativeAI } = require('@google/generative-ai');

var loggedIn = false;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'ohana-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
    if (!req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } else {
      res.redirect('/');
      console.log(`user already logged in`);
    }
});

app.get('/register', (req, res) => {
    if (!req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'register.html'));
    } else {
      res.redirect('/');
      console.log(`user already registered`);
    }
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
      console.error('no loging!');
      res.send('<p>Login error occurred.</p><a href="/login">Try again</a>');
    } else if (userObj) {
      req.session.user = userObj.username;
      req.session.userId = userObj.id;
      console.log(`User logged in: ${username}`);
      res.redirect('/');
    } else {
      res.send('<p>Invalid credentials.</p><a href="/login">Try again</a>');
    }
  });
});

app.get('/profile', (req,res) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    } else {
      res.redirect('/');
      console.log(`no profile! user not logged in`);
    }
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

    // Calculate zodiac sign
    const zodiacSign = user.getZodiac(row.birthday);

    // Add zodiac sign to the response
    const userData = {
      ...row,
      zodiac: zodiacSign
    };

    console.log('Sending user data:', userData);
    res.json(userData);
  });
});

app.get('/compatibility', (req,res) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'compatibility.html'));
    } else {
      res.redirect('/');
      console.log(`no compatibility! user not logged in`);
    }
});

app.post('/get-compatibility', async (req, res) => {
  const { sign1, sign2 } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `As an astrology expert, analyze the compatibility between ${sign1} and ${sign2}. Consider their elemental compatibility, personality traits, and potential challenges. Provide specific advice on how they can improve their relationship and work through any potential issues.

Please format your response using markdown with the following structure:

# ${sign1} and ${sign2} Compatibility Analysis

## Strengths
- Point 1
- Point 2
- Point 3

## Challenges
- Point 1
- Point 2
- Point 3

## Advice
- Point 1
- Point 2
- Point 3`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const markdownText = response.data.candidates[0].content.parts[0].text;

    const lines = markdownText.split('\n');

      let html = '';
      let inL = false;

      for (let line of lines) {
        line = line.trim();

        if (line.startsWith('# ')) {
          if (inL) {
            html += '</ul>\n';
            inL = false;
          }
          html += `<h1 class="text-3xl text-gray-800 mb-4">${line.slice(2).trim()}</h1>\n`;
        } else if (line.startsWith('## ')) {
          if (inL) {
            html += '</ul>\n';
            inL = false;
          }
          html += `<h2 class="text-2xl text-gray-800 mt-4 mb-2">${line.slice(3).trim()}</h2>\n`;
        } else if (line.startsWith('- ')) {
          if (!inL) {
            html += '<ul class="list-disc text-lg list-inside text-gray-800 mb-1">\n';
            inL = true;
          }
          html += `<li>${line.slice(2).trim()}</li>\n`;
        } else {
          if (inL) {
            html += '</ul>\n';
            inL = false;
          }
          html += `<p class="text-lg text-gray-800">${line}</p>\n`;
        }
      }
      if (inL) {
        html += '</ul>\n';
      }
    res.json({ suggestion: html });
  } catch (error) {
    console.error('Compatibility AI error:', error);
    res.status(500).json({ error: 'Failed to get compatibility advice' });
  }
});

app.get('/self', (req,res) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'selfimprov.html'));
    } else {
      res.redirect('/');
      console.log(`no self improvment! user not logged in`);
    }
});

app.post('/get-self-improvement', async (req, res) => {
  const { zodiac, concern } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `As a life coach and astrology expert, give self-improvement advice to a person with the zodiac sign ${zodiac}. 
They are currently struggling with the following issue: "${concern}". Based on the strengths and weaknesses of their sign, suggest personalized and practical steps to help them grow and resolve this issue.

Please format your response in **markdown** using the following structure:

# Advice for a ${zodiac}

## Insight
- Brief summary of the emotional dynamics and zodiac tendencies at play.

## Steps to Improve
- Step 1: ...
- Step 2: ...
- Step 3: ...

## Encouragement
- End with a brief message of motivation.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Gemini Response:", JSON.stringify(response.data, null, 2));

    const markdown = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!markdown) {
      throw new Error("Gemini did not return a valid response.");
    }

    res.json({ suggestion: markdown });

} catch (error) {
  console.error('Gemini self-improvement error:', error.message);
  if (error.response) {
    console.error('Gemini status:', error.response.status);
    console.error('Gemini data:', error.response.data);
  }
  res.status(500).json({ error: 'Failed to get self-improvement advice' });
}

});




// removed bc unable to deploy self fine tuned ai model
// app.post('/get-compatibility', async (req, res) => {
//   const { sign1, sign2 } = req.body;

//   try {
//     const response = await axios.post('http://localhost:5000/get-compatibility', {
//       sign1, sign2
//     });

//     res.json({ suggestion: response.data.suggestion });
//   } catch (error) {
//     console.error('Compatibility AI error:', error.message);
//     res.status(500).json({ error: 'Failed to get compatibility advice.' });
//   }
// });

// app.post('/get-self-improvement', async (req, res) => {
//   const { birthday, birthtime, location, gender } = req.body;

//   try {
//     const response = await axios.post('http://localhost:5000/get-self-improvement', {
//       birthday, birthtime, location, gender
//     });

//     res.json({ suggestion: response.data.suggestion });
//   } catch (error) {
//     console.error('Self-improvement AI error:', error.message);
//     res.status(500).json({ error: 'Failed to get self-improvement advice.' });
//   }
// });

// // Proxy API calls from Node.js → Python Flask
// app.use('/get-compatibility', createProxyMiddleware({
//   target: 'http://localhost:5000',
//   changeOrigin: true
// }));

// app.use('/get-self-improvement', createProxyMiddleware({
//   target: 'http://localhost:5000',
//   changeOrigin: true
// }));

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

//chatting

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/chat' });

app.get('/chat', (req, res) => {
    if (req.session.user) {
      res.sendFile(path.join(__dirname, 'public', 'chat.html'));
      console.log(`logged in user can chat`);
    } else {
      res.redirect('/');
      console.log(`no chatting! user not logged in`);
    }
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

//starts server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
