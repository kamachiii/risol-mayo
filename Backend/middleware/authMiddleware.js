const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "hakim_secret";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token diperlukan" });
  }

  // Support both "Bearer <token>" and raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;

