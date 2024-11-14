require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path')

app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.USER,
  password: process.env.PWD,
  database: 'industrial_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));

// Get starting page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// CRUD operations for products

// Get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get a products by ID
app.get('/products_id', (req, res) => {
  const id = req.query.id;

  db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  });
});

// Create a new order
app.post('/products', (req, res) => {
  const { name, articleNumber, price, description } = req.body;
  db.query('INSERT INTO products (id, name, articleNumber, price, description) VALUES (?, ?, ?, ?, ?)', [name, articleNumber, price, description], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Record added successfully', id: result.insertId });
  });
});

// Update a products
app.put('/products/:articleNumber', (req, res) => {
  const { id } = req.params;
  const { name, articleNumber, price, description } = req.body;
  db.query('UPDATE products SET name = ?, articleNumber = ?, price = ?, description = ? WHERE id = ?', [name, articleNumber, price, description], (err) => {
    if (err) throw err;
    res.json({ message: 'Record updated successfully' });
  });
});

// Delete a products
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.json({ message: 'Record deleted successfully' });
  });
});

// CRUD operations for orders

// Get all orders
app.get('/orders', (req, res) => {
  db.query('SELECT * FROM orders', (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(results);
  });
});

// Submit a new order
app.post('/submit-order', (req, res) => {
  const orderData = req.body;

  // First, get the current maximum order ID
  db.query('SELECT MAX(id) as maxId FROM orders', (err, results) => {
    if (err) {
      console.error('Error getting max order ID:', err);
      return res.status(500).json({ error: 'Failed to process order' });
    }

    // If no orders exist yet, start with 1, otherwise increment the max ID
    const newOrderId = results[0].maxId ? results[0].maxId + 1 : 1;

    // Loop through the form data
    Object.entries(orderData).forEach(([key, quantity]) => {
      if (key.startsWith('quantity-') && quantity > 0) {
        const articleNumber = key.replace('quantity-', '');

        // Get product info and create order
        db.query('SELECT * FROM products WHERE articleNumber = ?', [articleNumber], (err, results) => {
          if (err) {
            console.error('Error fetching product:', err);
            return;
          }

          if (results.length > 0) {
            const product = results[0];

            // Insert order into database with the order ID
            const insertQuery = 'INSERT INTO orders (id, quantity, articleNumber, name, price, description) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [
              newOrderId,
              quantity,
              articleNumber,
              product.name,
              product.price,
              product.description
            ];

            db.query(insertQuery, values, (err, result) => {
              if (err) console.error('Error inserting order:', err);
            });
          }
        });
      }
    });
    res.status(200).json({
      message: 'Orders submitted', orderId: newOrderId
    });
  });
});