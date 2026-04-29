const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "hakim_secret";

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("DB error on login:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login berhasil",
      token: token,
    });
  });
};

// REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("DB error on register:", err);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
      }

      res.json({ message: "Register berhasil" });
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.json({ message: "Logout berhasil" });
};

module.exports = { login, register, logout };

