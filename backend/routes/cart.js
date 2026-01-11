const express = require("express");
const db = require("../db");
const auth = require("../authMiddleware");
const router = express.Router();

/* ADD TO CART */
router.post("/add", auth, (req, res) => {
  const { product_name, price, quantity } = req.body;
  const userId = req.user.id;

  db.query(
    "SELECT id FROM cart WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error" });

      let cartId = result[0]?.id;

      if (!cartId) {
        db.query(
          "INSERT INTO cart (user_id) VALUES (?)",
          [userId],
          (err, result) => {
            if (err) return res.status(500).json({ msg: "DB error" });
            insertItem(result.insertId);
          }
        );
      } else {
        insertItem(cartId);
      }
    }
  );

  function insertItem(cartId) {
    db.query(
      "INSERT INTO cart_items (cart_id, product_name, price, quantity) VALUES (?,?,?,?)",
      [cartId, product_name, price, quantity],
      err => {
        if (err) return res.status(500).json({ msg: "Insert failed" });
        res.json({ msg: "Item added to cart" });
      }
    );
  }
});

/* VIEW CART */
router.get("/", auth, (req, res) => {
  db.query(
    `SELECT ci.id, ci.product_name, ci.price, ci.quantity
     FROM cart_items ci
     JOIN cart c ON ci.cart_id = c.id
     WHERE c.user_id = ?`,
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "Server error" });
      res.json(result);
    }
  );
});

/* UPDATE QUANTITY */
router.post("/update", auth, (req, res) => {
  const { cartId, change } = req.body;

  db.query(
    "UPDATE cart_items SET quantity = GREATEST(1, quantity + ?) WHERE id = ?",
    [change, cartId],
    err => {
      if (err) return res.status(500).json({ msg: "Update failed" });
      res.json({ msg: "Updated" });
    }
  );
});

/* REMOVE ITEM */
router.delete("/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM cart_items WHERE id = ?",
    [req.params.id],
    err => {
      if (err) return res.status(500).json({ msg: "Delete failed" });
      res.json({ msg: "Item removed" });
    }
  );
});

module.exports = router;
