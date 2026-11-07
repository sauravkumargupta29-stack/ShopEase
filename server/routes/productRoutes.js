const express = require("express");

const {
    getProducts,
    addProductReview,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const adminOnly = protect.adminOnly;

const router = express.Router();

router.get("/", getProducts);
router.post("/:id/reviews", protect, addProductReview);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
