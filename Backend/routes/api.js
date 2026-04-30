const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");
const ProductController = require("../controllers/productController");
const UserController = require("../controllers/userController");
const CartController = require("../controllers/cartController");
const OrderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadPaymentProof");

// AUTH (public)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);

// PRODUCTS (protected)
router.get("/products", verifyToken, ProductController.getAllProducts);
router.post("/products", verifyToken, ProductController.createProduct);
router.put("/products/:id", verifyToken, ProductController.updateProduct);
router.delete("/products/:id", verifyToken, ProductController.deleteProduct);

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

// ORDERS (protected)
router.get("/my-orders", verifyToken, OrderController.getMyOrders);
router.get("/my-orders/nested", verifyToken, OrderController.getMyOrdersNested);
router.post("/orders", verifyToken, OrderController.createOrder);
router.post( "/orders/:id/payment-proof", verifyToken, upload.single("payment_proof"), OrderController.uploadPaymentProof);

// ORDERS (admin)
router.get("/orders", verifyToken, requireAdmin, OrderController.getAllOrders);
router.put("/orders/:id/status", verifyToken, requireAdmin, OrderController.updateOrderStatus);
router.delete("/orders/:id", verifyToken, requireAdmin, OrderController.deleteOrder);

module.exports = router;
