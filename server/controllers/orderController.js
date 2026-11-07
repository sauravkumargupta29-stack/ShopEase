const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
    const updatedProducts = [];

    try {
        const { name, email, address, items } = req.body;

        if (!name?.trim() || !email?.trim() || !address?.trim()) {
            return res.status(400).json({
                message: "Name, email and address are required"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty"
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            if (
                !mongoose.isValidObjectId(item.productId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    message: "Invalid product or quantity"
                });
            }

            const product = await Product.findById(item.productId);

            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    message: "Product unavailable or insufficient stock"
                });
            }

            totalAmount += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        // Reduce stock safely
        for (const item of orderItems) {
            const result = await Product.updateOne(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                }
            );

            if (result.modifiedCount !== 1) {
                throw new Error("INSUFFICIENT_STOCK");
            }

            updatedProducts.push(item);
        }

        const order = await Order.create({
            user: req.userId,
            customer: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                address: address.trim()
            },
            items: orderItems,
            totalAmount
        });

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        // Restore stock if order creation fails
        for (const item of updatedProducts) {
            await Product.updateOne(
                { _id: item.product },
                { $inc: { stock: item.quantity } }
            );
        }

        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({
                message: "Stock is no longer available. Please refresh your cart."
            });
        }

        console.error("Order error:", error.message);

        res.status(500).json({
            message: "Unable to place order"
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const email = req.query.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // A user can only view their own orders
        const orders = await Order.find({
            user: req.userId,
            "customer.email": email
        }).sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {
        console.error("Fetch orders error:", error.message);

        res.status(500).json({
            message: "Unable to fetch orders"
        });
    }
};

module.exports = { createOrder, getOrders };
