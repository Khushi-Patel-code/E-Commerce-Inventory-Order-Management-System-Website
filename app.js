// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const pool = require('./db/connection'); // your DB pool
const productsRouter = require('./routes/products'); // products route

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/products', productsRouter);

const externalRoutes = require("./routes/external");
app.use("/api/external", externalRoutes);

app.use("/api/webservice", require("./routes/webservice"));

// health check (ping)
app.get('/api/ping', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, db_result: rows[0].result });
  } catch (err) {
    console.error('Ping DB error:', err.message || err);
    res.status(500).json({ success: false, error: 'DB ping failed' });
  }
});

// fallback for any other API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Unknown API endpoint' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

