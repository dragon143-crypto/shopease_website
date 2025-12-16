import express from "express";
import multer from "multer";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Uploads folder
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ----------------- API: Chat -----------------
app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message || "";

  res.json({
    reply:
      "Thanks for your message! (DEMO)\n\nWe received: " + userMsg,
  });
});

// ----------------- API: Upload (Screenshots) -----------------
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    url: "/uploads/" + req.file.filename,
  });
});

// ----------------- API: Voice Upload -----------------
app.post("/api/voice", upload.single("voice"), (req, res) => {
  res.json({
    success: true,
    message: "Voice received (DEMO).",
    file: "/uploads/" + req.file.filename,
  });
});

// ----------------- API: Product Details -----------------
app.get("/api/product/:id", (req, res) => {
  const id = req.params.id;

  res.json({
    id,
    title: "Wireless Headphones",
    price: 2499,
    mrp: 4999,
    colors: ["Black", "White"],
    images: [
      "https://images.pexels.com/photos/3394652/pexels-photo-3394652.jpeg"
    ],
    description: "Premium wireless headphones with 40hr battery life."
  });
});

// ----------------- API: Payment -----------------
app.post("/api/payment/create", (req, res) => {
  const amount = req.body.amount;

  res.json({
    success: true,
    transactionId: "TXN-" + Date.now(),
    amount,
  });
});

// ----------------- START SERVER -----------------
app.listen(4000, () =>
  console.log("🚀 Server running at http://localhost:4000")
);
