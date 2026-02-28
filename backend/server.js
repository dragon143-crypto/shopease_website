const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const multer = require("multer"); // Optional for uploads if needed later

const app = express();
const PORT = 5000;
const SECRET = "SHOPEASE_SECRET_KEY";

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* 🔥 SERVE FRONTEND (PROJECT ROOT, NOT BACKEND) */
const ROOT_PATH = path.join(__dirname, "..");
app.use(express.static(ROOT_PATH));

/* ================= DATABASE SETUP ================= */
let db;

async function connectDb() {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "shopease"
    });
    console.log("✅ MySQL Connected to shopease DB");

    // Initialize tables to ensure the backend works perfectly
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT DEFAULT 1,
        image_url VARCHAR(500),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log("✅ Database tables initialized successfully.");
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error("❌ Database 'shopease' does not exist. Please create it manually in MySQL: CREATE DATABASE shopease;");
    } else {
      console.error("❌ DB Connection/Initialization Failed:", err);
    }
  }
}

connectDb();

/* ================= AUTH MIDDLEWARE ================= */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "Token missing" });

  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// Optional middleware for routes that don't require auth but might have it
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    req.userId = null;
    return next();
  }
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
  jwt.verify(token, SECRET, (err, decoded) => {
    if (!err) req.userId = decoded.id;
    else req.userId = null;
    next();
  });
}

/* ================= FRONTEND ROUTES ================= */
// Pages that handle their own routing or fallbacks to HTML
app.get("/login", (req, res) => res.sendFile(path.join(ROOT_PATH, "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(ROOT_PATH, "signup.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(ROOT_PATH, "profile.html")));
app.get("/cart", (req, res) => res.sendFile(path.join(ROOT_PATH, "cart.html")));

/* ================= AUTH APIs ================= */
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (rows.length > 0) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.insertId }, SECRET, { expiresIn: "7d" });
    res.json({ token, msg: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during signup" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length) return res.status(401).json({ msg: "User not found" });

    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: rows[0].id }, SECRET, { expiresIn: "7d" });
    res.json({ token, msg: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

/* ================= USER APIs ================= */
app.get("/api/user/profile", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, profile_image, created_at FROM users WHERE id=?", [req.userId]);
    if (!rows.length) return res.status(404).json({ msg: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Server error fetching profile" });
  }
});

app.post("/api/user/password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await db.query("SELECT password FROM users WHERE id=?", [req.userId]);
    if (!rows.length) return res.status(404).json({ msg: "User not found" });

    const ok = await bcrypt.compare(oldPassword, rows[0].password);
    if (!ok) return res.status(401).json({ msg: "Incorrect old password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password=? WHERE id=?", [hashedPassword, req.userId]);
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating password" });
  }
});

/* ================= CART APIs ================= */
// Get Cart Items
app.get("/api/cart", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cart WHERE user_id=?", [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching cart" });
  }
});

// Add to Cart
app.post("/api/cart", auth, async (req, res) => {
  const { productId, productName, price, quantity = 1, imageUrl = "" } = req.body;
  try {
    // Check if item exists
    const [existing] = await db.query("SELECT * FROM cart WHERE user_id=? AND product_id=?", [req.userId, productId]);
    if (existing.length > 0) {
      // Update quantity
      await db.query("UPDATE cart SET quantity = quantity + ? WHERE id=?", [quantity, existing[0].id]);
    } else {
      // Insert new
      await db.query(
        "INSERT INTO cart (user_id, product_id, product_name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [req.userId, productId, productName, price, quantity, imageUrl]
      );
    }
    res.json({ msg: "Added to cart successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error adding to cart" });
  }
});

// Update Cart Quantity
app.post("/api/cart/update", auth, async (req, res) => {
  const { cartId, quantity } = req.body;
  try {
    if (quantity <= 0) {
      await db.query("DELETE FROM cart WHERE id=? AND user_id=?", [cartId, req.userId]);
    } else {
      await db.query("UPDATE cart SET quantity=? WHERE id=? AND user_id=?", [quantity, cartId, req.userId]);
    }
    res.json({ msg: "Cart updated" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating cart" });
  }
});

// Remove Cart Item
app.delete("/api/cart/:id", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM cart WHERE id=? AND user_id=?", [req.params.id, req.userId]);
    res.json({ msg: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ msg: "Error removing item" });
  }
});

/* ================= ORDER APIs ================= */
app.get("/api/orders", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC", [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching orders" });
  }
});

app.post("/api/order/checkout", auth, async (req, res) => {
  const { totalAmount } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'Confirmed')",
      [req.userId, totalAmount]
    );
    // Clear cart after checkout
    await db.query("DELETE FROM cart WHERE user_id=?", [req.userId]);
    res.json({ orderId: result.insertId, msg: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Checkout failed" });
  }
});

app.get("/api/order/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders WHERE id=? AND user_id=?", [req.params.id, req.userId]);
    if (!rows.length) return res.status(404).json({ msg: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching order" });
  }
});

/* ================= UTILITY / SUPPORT APIs ================= */
app.post("/api/feedback", optionalAuth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ msg: "Feedback text is required" });
  try {
    await db.query("INSERT INTO feedback (user_id, text) VALUES (?, ?)", [req.userId || null, text]);
    res.json({ msg: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error submitting feedback" });
  }
});

// Mock endpoints for chat/voice/upload
app.post("/api/chat", (req, res) => res.json({ response: "Hello! This is an automated chat response from ShopEase backend." }));
app.post("/api/upload", (req, res) => res.json({ msg: "File uploaded successfully (mocked)", url: "/mock-url" }));
app.post("/api/voice", (req, res) => res.json({ msg: "Voice processed successfully (mocked)", text: "mock voice text" }));

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
