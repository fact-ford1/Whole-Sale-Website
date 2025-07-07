const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();
const productsPath = path.join(__dirname, 'data', 'products.json');
const imagesDir = path.join(__dirname, 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

app.use(express.json());
app.use(express.static(__dirname));
app.use('/images', express.static(imagesDir));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all products
app.get('/api/products', (req, res) => {
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({error: 'Read error'});
    res.json(JSON.parse(data));
  });
});

// Add new product
app.post('/api/products', (req, res) => {
  const { name, price, stock, image } = req.body;
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({error: 'Read error'});
    let products = JSON.parse(data);
    products.push({ name, price, stock, image });
    fs.writeFile(productsPath, JSON.stringify(products, null, 2), err => {
      if (err) return res.status(500).json({error: 'Write error'});
      res.json({ success: true });
    });
  });
});

// Edit product by index
app.put('/api/products/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const { name, price, stock, image } = req.body;
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({error: 'Read error'});
    let products = JSON.parse(data);
    if (idx < 0 || idx >= products.length) return res.status(404).json({error: 'Not found'});
    products[idx] = { name, price, stock, image };
    fs.writeFile(productsPath, JSON.stringify(products, null, 2), err => {
      if (err) return res.status(500).json({error: 'Write error'});
      res.json({ success: true });
    });
  });
});

// Delete product by index
app.delete('/api/products/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  fs.readFile(productsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({error: 'Read error'});
    let products = JSON.parse(data);
    if (idx < 0 || idx >= products.length) return res.status(404).json({error: 'Not found'});
    products.splice(idx, 1);
    fs.writeFile(productsPath, JSON.stringify(products, null, 2), err => {
      if (err) return res.status(500).json({error: 'Write error'});
      res.json({ success: true });
    });
  });
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({error: 'No file uploaded'});
  res.json({ imageUrl: '/images/' + req.file.filename });
});

// Email sending endpoint for admin replies
app.post('/api/reply-message', async (req, res) => {
  const { to, subject, text } = req.body;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kobinaebobiz@gmail.com', // Replace with your admin email
      pass: 'kobinaebobiz@1'
    }
  });
  try {
    await transporter.sendMail({
      from: '"Goford Enterprise" <kobinaebobiz@gmail.com>',
      to,
      subject,
      text
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Endpoint to send user messages to admin's email
app.post('/api/contact-message', async (req, res) => {
  const { name, email, message } = req.body;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kobinaebobiz@gmail.com',
      pass: 'kobinaebobiz@1'
    }
  });
  try {
    await transporter.sendMail({
      from: '"Goford Enterprise Contact" <kobinaebobiz@gmail.com>',
      to: 'kobinaebobiz@gmail.com',
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
