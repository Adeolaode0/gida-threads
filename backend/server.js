const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static assets from frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/images', express.static(path.join(frontendPath, 'images')));

// -------------------------------------------------------------
// Product API Endpoints
// -------------------------------------------------------------

// GET /api/products (filter by category, search query, sort)
app.get('/api/products', (req, res) => {
  const { category, search, sort, in_stock_only } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR badge LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (in_stock_only === 'true') {
    sql += ' AND in_stock = 1 AND stock_quantity > 0';
  }

  if (sort === 'price-asc') {
    sql += ' ORDER BY price ASC';
  } else if (sort === 'price-desc') {
    sql += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    sql += ' ORDER BY rating DESC';
  } else {
    sql += ' ORDER BY id ASC';
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse JSON fields
    const parsedRows = rows.map(item => ({
      ...item,
      details: item.details ? JSON.parse(item.details) : [],
      sizes: item.sizes ? JSON.parse(item.sizes) : [],
      colors: item.colors ? JSON.parse(item.colors) : []
    }));
    res.json(parsedRows);
  });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json({
      ...row,
      details: row.details ? JSON.parse(row.details) : [],
      sizes: row.sizes ? JSON.parse(row.sizes) : [],
      colors: row.colors ? JSON.parse(row.colors) : []
    });
  });
});

// POST /api/products (Admin)
app.post('/api/products', (req, res) => {
  const {
    name, category, price, original_price, description,
    details, sizes, colors, stock_quantity, image_url, badge
  } = req.body;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const in_stock = (stock_quantity && stock_quantity > 0) ? 1 : 0;

  const sql = `
    INSERT INTO products (
      name, slug, category, price, original_price, description,
      details, sizes, colors, in_stock, stock_quantity, image_url, badge
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    slug,
    category || 'hoodies',
    parseFloat(price) || 0,
    parseFloat(original_price) || null,
    description || '',
    JSON.stringify(details || []),
    JSON.stringify(sizes || ['S', 'M', 'L', 'XL']),
    JSON.stringify(colors || [{ name: 'Black', hex: '#000000' }]),
    in_stock,
    parseInt(stock_quantity, 10) || 0,
    image_url || '/images/hoodie.jpg',
    badge || 'New Drop'
  ];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, message: 'Product added successfully' });
  });
});

// PUT /api/products/:id (Admin)
app.put('/api/products/:id', (req, res) => {
  const { price, stock_quantity, in_stock, badge, name } = req.body;
  const updates = [];
  const params = [];

  if (price !== undefined) {
    updates.push('price = ?');
    params.push(parseFloat(price));
  }
  if (stock_quantity !== undefined) {
    updates.push('stock_quantity = ?');
    params.push(parseInt(stock_quantity, 10));
    updates.push('in_stock = ?');
    params.push(parseInt(stock_quantity, 10) > 0 ? 1 : 0);
  }
  if (badge !== undefined) {
    updates.push('badge = ?');
    params.push(badge);
  }
  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(req.params.id);
  const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product updated successfully' });
  });
});

// DELETE /api/products/:id (Admin)
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product removed' });
  });
});

// -------------------------------------------------------------
// Order API Endpoints
// -------------------------------------------------------------

// POST /api/orders (Checkout)
app.post('/api/orders', (req, res) => {
  const {
    customer_name, customer_email, shipping_address, city,
    postal_code, country, total_amount, discount_amount,
    currency, payment_method, items
  } = req.body;

  if (!customer_name || !customer_email || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  const orderId = 'GID-' + Math.floor(100000 + Math.random() * 900000);

  const sql = `
    INSERT INTO orders (
      id, customer_name, customer_email, shipping_address, city,
      postal_code, country, total_amount, discount_amount, currency,
      payment_method, status, items_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    orderId,
    customer_name,
    customer_email,
    shipping_address || '123 Fashion Ave',
    city || 'New York',
    postal_code || '10001',
    country || 'United States',
    parseFloat(total_amount),
    parseFloat(discount_amount) || 0,
    currency || 'USD',
    payment_method || 'Credit Card',
    'Confirmed',
    JSON.stringify(items)
  ];

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });

    // Decrement stock for purchased items
    items.forEach(item => {
      if (item.id) {
        db.run(
          `UPDATE products 
           SET stock_quantity = MAX(0, stock_quantity - ?),
               in_stock = CASE WHEN stock_quantity - ? <= 0 THEN 0 ELSE 1 END
           WHERE id = ?`,
          [item.quantity || 1, item.quantity || 1, item.id]
        );
      }
    });

    res.status(201).json({
      success: true,
      order_id: orderId,
      customer_name,
      total_amount,
      currency: currency || 'USD',
      status: 'Confirmed',
      message: 'Order created successfully'
    });
  });
});

// GET /api/orders (Admin order overview)
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));
    res.json(parsed);
  });
});

// PUT /api/orders/:id/status (Admin change order status)
app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order status updated', status });
  });
});

// -------------------------------------------------------------
// Analytics / Stats Endpoint (Admin)
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  db.get(`
    SELECT 
      COALESCE(SUM(total_amount), 0) AS total_revenue,
      COUNT(id) AS total_orders
    FROM orders
  `, (err, orderStats) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get(`
      SELECT 
        COUNT(id) AS total_products,
        SUM(CASE WHEN stock_quantity <= 5 THEN 1 ELSE 0 END) AS low_stock_count
      FROM products
    `, (err2, productStats) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        total_revenue: orderStats.total_revenue,
        total_orders: orderStats.total_orders,
        total_products: productStats.total_products,
        low_stock_count: productStats.low_stock_count
      });
    });
  });
});

// -------------------------------------------------------------
// Newsletter Endpoint
// -------------------------------------------------------------
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  db.run('INSERT OR IGNORE INTO newsletter (email) VALUES (?)', [email], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      message: 'Welcome to the Gida Syndicate. Enjoy 10% off your next order with code: GIDA10',
      discount_code: 'GIDA10'
    });
  });
});

// Fallback for HTML5 client routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` GIDA THREADS E-COMMERCE SERVER RUNNING`);
  console.log(` Local URL:    http://localhost:${PORT}`);
  console.log(` API URL:      http://localhost:${PORT}/api/products`);
  console.log(` Environment:  Development (SQLite DB initialized)`);
  console.log(`====================================================`);
});
