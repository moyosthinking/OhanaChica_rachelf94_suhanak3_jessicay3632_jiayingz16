const express = require('express');
const path = require('path');
const app = express();
const port = 4001;

app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
  //res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});