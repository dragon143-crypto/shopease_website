const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET = "SHOPEASE_SECRET_KEY";

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* 🔥 SERVE FRONTEND (PROJECT ROOT, NOT BACKEND) */
const ROOT_PATH = path.join(__dirname, "..");
app.use(express.static(ROOT_PATH));

/* ================= DATABASE ================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "shopease"
});

db.connect(err => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
    return;
  }
  console.log("✅ MySQL Connected");
});

/* ================= AUTH MIDDLEWARE ================= */

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "Token missing" });

  const token = header.startsWith("Bearer ")
    ? header.split(" ")[1]
    : header;

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

/* ================= FRONTEND ROUTES ================= */

/* ✅ LOGIN PAGE */
app.get("/login", (req, res) => {
  res.sendFile(path.join(ROOT_PATH, "login.html"));
});

/* ✅ PROFILE PAGE */
app.get("/profile", (req, res) => {
  res.sendFile(path.join(ROOT_PATH, "profile.html"));
});

/* ================= AUTH APIs ================= */

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ msg: "DB error" });
    if (!rows.length) return res.status(401).json({ msg: "User not found" });

    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: rows[0].id }, SECRET, { expiresIn: "7d" });
    res.json({ token });
  });
});

app.get("/api/user/profile", auth, (req, res) => {
  db.query(
    "SELECT id,name,email,profile_image FROM users WHERE id=?",
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json(rows[0]);
    }
  );
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
