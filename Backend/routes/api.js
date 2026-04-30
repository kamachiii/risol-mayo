const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");
const ProductController = require("../controllers/ProductController");
const UserController = require("../controllers/userController");
const CartController = require("../controllers/cartController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// AUTH (public)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);

// PRODUCTS (protected)
router.get("/products", verifyToken, ProductController.index);
router.get("/products/:id", verifyToken, ProductController.show);
router.post("/products", verifyToken, ProductController.store);
router.put("/products/:id", verifyToken, ProductController.update);
router.delete("/products/:id", verifyToken, ProductController.destroy);

// USERS (protected)
router.get("/users", verifyToken, UserController.getAllUsers);
router.post("/users", verifyToken, UserController.createUser);
router.put("/users/:id", verifyToken, UserController.updateUser);
router.delete("/users/:id", verifyToken, UserController.deleteUser);

// CART (protected)
router.get("/cart", verifyToken, CartController.getCart);
router.post("/cart/items", verifyToken, CartController.addItem);
router.patch("/cart/items/:id", verifyToken, CartController.updateItem);
router.delete("/cart/items/:id", verifyToken, CartController.deleteItem);

module.exports = router;
