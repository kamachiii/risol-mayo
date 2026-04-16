const db = require("../config/database");

// 1. GET: Melihat isi keranjang
const getCart = (req, res) => {
  const userId = req.user.id; // Diambil dari token JWT

  const sql = `
    SELECT 
      c.id AS cart_item_id,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS unit_price,
      c.quantity,
      (p.price * c.quantity) AS subtotal
    FROM 
      cart_items c
    JOIN 
      products p ON c.product_id = p.id
    WHERE 
      c.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB error on getCart:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    const grandTotal = results.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

    res.json({
      status: "success",
      data: {
        items: results,
        grand_total: grandTotal
      }
    });
  });
};

// 2. POST: Tambah produk ke keranjang
const addItem = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  // Logika: Jika barang sudah ada, tambah quantity-nya. Jika belum, insert baru.
  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;

  db.query(sql, [userId, product_id, quantity], (err, result) => {
    if (err) {
      console.error("DB error on addItem:", err);
      return res.status(500).json({ message: "Gagal menambahkan ke keranjang" });
    }
    res.status(201).json({ status: "success", message: "Produk berhasil ditambahkan" });
  });
};

// 3. PATCH: Update quantity item tertentu
const updateItem = (req, res) => {
  const { id } = req.params; // ID dari cart_item
  const { quantity } = req.body;

  const sql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
  db.query(sql, [quantity, id], (err, result) => {
    if (err) {
      console.error("DB error on updateItem:", err);
      return res.status(500).json({ message: "Gagal memperbarui jumlah" });
    }
    res.json({ status: "success", message: "Jumlah berhasil diperbarui" });
  });
};

// 4. DELETE: Hapus item dari keranjang
const deleteItem = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM cart_items WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DB error on deleteItem:", err);
      return res.status(500).json({ message: "Gagal menghapus item" });
    }
    res.json({ status: "success", message: "Item dihapus dari keranjang" });
  });
};

module.exports = { getCart, addItem, updateItem, deleteItem };