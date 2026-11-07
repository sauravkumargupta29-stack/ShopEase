const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        customer: {
            name: { type: String, required: true },
            email: { type: String, required: true, lowercase: true },
            address: { type: String, required: true }
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true }
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
            default: "Placed"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
