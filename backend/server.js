const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "SHOPEASE_SECRET_KEY";

// DB Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",   // change if needed
  database: "shopease"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash],
    (err) => {
      if (err) return res.status(400).json({ msg: "User exists" });
      res.json({ msg: "Signup successful" });
    }
  );
});


// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (result.length === 0)
        return res.status(401).json({ msg: "User not found" });

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(401).json({ msg: "Invalid password" });

      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });

      res.json({ token });
    }
  );
});


// ================= AUTH MIDDLEWARE =================
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ msg: "No token" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}


// ================= GET USER DATA =================
app.get("/profile", auth, (req, res) => {
  db.query(
    "SELECT email FROM users WHERE id=?",
    [req.userId],
    (err, result) => {
      res.json(result[0]);
    }
  );
});


// ================= CART =================
app.post("/cart", auth, (req, res) => {
  const { product_name, qty } = req.body;

  db.query(
    "INSERT INTO cart (user_id, product_name, qty) VALUES (?, ?, ?)",
    [req.userId, product_name, qty],
    () => res.json({ msg: "Added to cart" })
  );
});

app.get("/cart", auth, (req, res) => {
  db.query(
    "SELECT * FROM cart WHERE user_id=?",
    [req.userId],
    (err, result) => res.json(result)
  );
});


// ================= SERVER =================
app.listen(5000, () => console.log("Server running on port 5000"));
