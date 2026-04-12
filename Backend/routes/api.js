const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/productController");
const AuthController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// AUTH
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);

// PRODUCTS (pakai token)
router.get("/products", verifyToken, ProductController.getAllProducts);
router.post("/products", verifyToken, ProductController.createProduct);
router.put("/products/:id", verifyToken, ProductController.updateProduct);
router.delete("/products/:id", verifyToken, ProductController.deleteProduct);

module.exports = router;