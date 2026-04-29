const db = require("../config/database");

// GET - Semua order (Admin)
const getAllOrders = (req, res) => {
  const sql = `
    SELECT o.id, o.status, o.total_amount, o.shipping_address, 
           o.payment_proof, o.created_at,
           u.name AS user_name, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error on getAllOrders:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    res.json(results);
  });
};

// GET - Order history milik user yang login
const getMyOrders = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT o.id, o.status, o.total_amount, o.shipping_address, o.created_at,
           oi.quantity, oi.price_at_purchase,
           p.name AS product_name
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB error on getMyOrders:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    res.json(results);
  });
};

// POST - Buat order baru
const createOrder = (req, res) => {
  const userId = req.user.id;
  const { items, shipping_address } = req.body;
  // items = [{ product_id, quantity, price_at_purchase }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order tidak boleh kosong" });
  }
  if (!shipping_address) {
    return res.status(400).json({ message: "Alamat pengiriman wajib diisi" });
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity, 0
  );

  const sqlOrder = "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)";
  db.query(sqlOrder, [userId, totalAmount, shipping_address], (err, result) => {
    if (err) {
      console.error("DB error on createOrder:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    const orderId = result.insertId;
    const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?";
    const values = items.map((item) => [
      orderId,
      item.product_id,
      item.quantity,
      item.price_at_purchase,
    ]);

    db.query(sqlItems, [values], (err2) => {
      if (err2) {
        console.error("DB error on insert order_items:", err2);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
      }
      res.json({ message: "Order berhasil dibuat", order_id: orderId });
    });
  });
};

// PUT - Admin update status order (Fulfillment)
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatus = ["pending", "paid", "shipped"];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  const sql = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("DB error on updateOrderStatus:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    res.json({ message: "Status order berhasil diupdate" });
  });
};

module.exports = { getAllOrders, getMyOrders, createOrder, updateOrderStatus };