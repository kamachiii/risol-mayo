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

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: token
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

      res.status(201).json({
        message: "Register berhasil",
        user: {
          id: result.insertId,
          name,
          email
        }
      });
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// LOGOUT
const logout = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    const sql = "SELECT id, name, email FROM users WHERE id=?";
    db.query(sql, [decoded.id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Terjadi kesalahan server" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const user = results[0];

      return res.json({
        message: "Logout berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });

  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

module.exports = { login, register, logout };

