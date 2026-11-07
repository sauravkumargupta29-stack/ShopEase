const express = require("express");
const {
    getDashboardStats,
    getAdminOrders,
    getAdminCustomers,
    updateOrderStatus
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = protect.adminOnly;
const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/customers", getAdminCustomers);

module.exports = router;
