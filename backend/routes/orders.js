app.get("/orders", authMiddleware, (req, res) => {
  db.query(
    `SELECT o.id, o.total, o.status, i.product_name, i.image, i.price
     FROM orders o
     JOIN order_items i ON o.id = i.order_id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.sendStatus(500);
      res.json(rows);
    }
  );
});
