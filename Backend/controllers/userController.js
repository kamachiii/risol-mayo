const db = require("../config/database");

// GET all users
const getAllUsers = (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) {
      console.error("DB error on getAllUsers:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    res.json(results);
  });
};

// POST create user
const createUser = (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error("DB error on createUser:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    res.json({ message: "User berhasil ditambahkan" });
  });
};

// PUT update user
const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const sql = "UPDATE users SET name=?, email=? WHERE id=?";
  db.query(sql, [name, email, id], (err, result) => {
    if (err) {
      console.error("DB error on updateUser:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: `User ${id} berhasil diupdate` });
  });
};

// DELETE user
const deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DB error on deleteUser:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: `User ${id} berhasil dihapus` });
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };

