// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const pool = require('./db/connection'); // your DB pool

app.use(cors());

const productsRouter = require('./routes/products'); // admin products route
const customerProducts = require('./routes/customerProducts');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const ordersRoutes = require('./routes/orders'); 
const webserviceRoutes = require('./routes/webservice');
app.use("/api/webservice", require("./routes/webservice"));
app.use(express.static('public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/products', customerProducts);
app.use('/api/products', productsRouter);
app.use('/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/admin', adminRoutes);
app.use('/api/orders', ordersRoutes); 

const warehousesRoutes = require('./routes/warehouse');
app.use('/api/warehouses', warehousesRoutes);

const externalRoutes = require("./routes/external");
app.use("/api/external", externalRoutes);

const supplierRoutes = require('./routes/suppliers');
app.use('/api/suppliers', supplierRoutes);

const inventoryRoutes = require('./routes/inventory');
app.use('/api/inventory', inventoryRoutes);

const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

const chartsRouter = require('./routes/charts');
app.use('/api/charts', chartsRouter);

const viewsRouter = require('./routes/views');
app.use('/api/views', viewsRouter);

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

