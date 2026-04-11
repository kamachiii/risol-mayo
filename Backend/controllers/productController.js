const db = require("../config/database");

// GET
const getAllProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST
const createProduct = (req, res) => {
  const { name, price, description } = req.body;

  const sql = "INSERT INTO products (name, price, description) VALUES (?, ?, ?)";
  db.query(sql, [name, price, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produk berhasil ditambahkan" });
  });
};

// PUT
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  const sql = "UPDATE products SET name=?, price=?, description=? WHERE id=?";
  db.query(sql, [name, price, description, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produk berhasil diupdate" });
  });
};

// DELETE
const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produk berhasil dihapus" });
  });
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};