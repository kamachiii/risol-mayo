const db = require("../config/database");

// GET all users
const getAllUsers = (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) {
      console.error("DB error on getAllUsers:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    res.json({
      message: "Data user berhasil diambil",
      users: results
    });
  });
};

// POST create user
const createUser = (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error("DB error on createUser:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    res.json({
      message: "User berhasil ditambahkan",
      user: {
        id: result.insertId,
        name,
        email
      }
    });
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

    res.json({
      message: "User berhasil diupdate",
      user: {
        id,
        name,
        email
      }
    });
  });
};

// DELETE user
const deleteUser = (req, res) => {
  const { id } = req.params;

  // ambil data dulu sebelum dihapus
  db.query("SELECT * FROM users WHERE id=?", [id], (err, rows) => {
    if (err) {
      console.error("DB error on deleteUser:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const deletedUser = rows[0];

    db.query("DELETE FROM users WHERE id=?", [id], (err2, result) => {
      if (err2) {
        console.error("DB error on deleteUser:", err2);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
      }

      res.json({
        message: "User berhasil dihapus",
        user: {
          id: deletedUser.id,
          name: deletedUser.name,
          email: deletedUser.email
        }
      });
    });
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };

