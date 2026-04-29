const db = require("../config/database");

// GET
const getAllProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("DB error on getAllProducts:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    res.json(results);
  });
};

// POST
const createProduct = (req, res) => {
  const { name, price, description } = req.body;

  const sql = "INSERT INTO products (name, price, description) VALUES (?, ?, ?)";
  db.query(sql, [name, price, description], (err, result) => {
    if (err) {
      console.error("DB error on createProduct:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    res.json({ message: "Produk berhasil ditambahkan" });
  });
};

// PUT
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  const sql = "UPDATE products SET name=?, price=?, description=? WHERE id=?";
  db.query(sql, [name, price, description, id], (err, result) => {
    if (err) {
      console.error("DB error on updateProduct:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json({ message: "Produk berhasil diupdate" });
  });
};

// DELETE
const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DB error on deleteProduct:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json({ message: "Produk berhasil dihapus" });
  });
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

