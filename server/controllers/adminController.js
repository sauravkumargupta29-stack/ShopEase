const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

const getDashboardStats = async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalUsers] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments()
        ]);

        const revenueResult = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("customer totalAmount status createdAt");

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue: revenueResult[0]?.total || 0,
            recentOrders
        });

    } catch (error) {
        console.error("Dashboard error:", error.message);

        res.status(500).json({
            message: "Unable to load dashboard statistics"
        });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json(orders);

    } catch (error) {
        console.error("Admin orders error:", error.message);

        res.status(500).json({
            message: "Unable to load orders"
        });
    }
};

const getAdminCustomers = async (req, res) => {
    try {
        const customers = await User.find()
            .select("name email role createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.json(customers);

    } catch (error) {
        console.error("Admin customers error:", error.message);

        res.status(500).json({
            message: "Unable to load customers"
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = [
            "Placed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        const { status } = req.body;
        const orderId = req.params.id;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const existingOrder = await Order.findById(orderId);

        if (!existingOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (existingOrder.status === "Cancelled") {
            return res.status(400).json({
                message: "A cancelled order cannot be changed"
            });
        }

        if (existingOrder.status === status) {
            return res.json({
                message: "Order status is already updated",
                order: existingOrder
            });
        }

        // Only Placed orders can be cancelled
        if (status === "Cancelled") {
            if (existingOrder.status !== "Placed") {
                return res.status(400).json({
                    message: "Only placed orders can be cancelled"
                });
            }

            // Atomic status change prevents duplicate stock restoration
            const cancelledOrder = await Order.findOneAndUpdate(
                {
                    _id: orderId,
                    status: "Placed"
                },
                {
                    $set: { status: "Cancelled" }
                },
                { new: true }
            );

            if (!cancelledOrder) {
                return res.status(409).json({
                    message: "Order status changed. Please refresh."
                });
            }

            // Restore stock once for each order item
            const stockOperations = cancelledOrder.items.map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: {
                        $inc: { stock: item.quantity }
                    }
                }
            }));

            if (stockOperations.length > 0) {
                await Product.bulkWrite(stockOperations);
            }

            return res.json({
                message: "Order cancelled and stock restored successfully",
                order: cancelledOrder
            });
        }

        // Allowed forward transitions: Placed -> Shipped -> Delivered
        const expectedPreviousStatus = {
            Shipped: "Placed",
            Delivered: "Shipped"
        };

        const previousStatus = expectedPreviousStatus[status];

        if (!previousStatus || existingOrder.status !== previousStatus) {
            return res.status(400).json({
                message: "Invalid order status transition"
            });
        }

        const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                status: previousStatus
            },
            {
                $set: { status }
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(409).json({
                message: "Order status changed. Please refresh."
            });
        }

        res.json({
            message: "Order status updated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Order status error:", error.message);

        res.status(500).json({
            message: "Unable to update order status"
        });
    }
};

module.exports = {
    getDashboardStats,
    getAdminOrders,
    getAdminCustomers,
    updateOrderStatus
};
