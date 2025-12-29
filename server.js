const express = require('express');
const path = require('path'); // Dagdag ito
const app = express();

// Dagdag ito para i-serve ang static HTML/CSS files
app.use(express.static(path.join(__dirname, '.')));

// Para kapag binuksan ang link, ipakita agad ang index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Para kapag pumunta sa /dashboard, ipakita ang dashboard.html
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Iwan mo lang yung ibang code mo tulad ng port at iba pang routes
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('KCV PANEL SERVER ONLINE');
});
