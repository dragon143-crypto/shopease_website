// server.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); // Enable requests from your frontend

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe checkout session
app.post("/create-stripe-session", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Convert unit_price to paise (smallest currency unit)
    const line_items = items.map(item => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.unit_price * 100), // e.g., ₹499 → 49900 paise
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "upi"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:4242/success.html",
      cancel_url: "http://localhost:4242/cancel.html",
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Optional: simple health check
app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
