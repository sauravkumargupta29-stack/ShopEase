const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch products"
        });
    }
};

// Add new product
const createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name?.trim() || price === undefined || Number(price) < 0) {
            return res.status(400).json({
                message: "Valid product name and price are required"
            });
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Unable to delete product"
        });
    }
};

// Add or update a customer's review
const addProductReview = async (req, res) => {
    try {
        const rating = Number(req.body.rating);
        const comment = String(req.body.comment || "").trim();

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        if (comment.length > 1000) {
            return res.status(400).json({
                message: "Review cannot exceed 1000 characters"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const existingReview = product.reviews.find(
            review => review.user.toString() === req.userId.toString()
        );

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.name = req.user.name;
            existingReview.createdAt = new Date();
        } else {
            product.reviews.push({
                user: req.userId,
                name: req.user.name,
                rating,
                comment
            });
        }

        product.numReviews = product.reviews.length;
        product.averageRating = Number(
            (product.reviews.reduce((sum, review) => sum + review.rating, 0)
                / product.numReviews).toFixed(1)
        );

        await product.save();

        res.status(201).json({
            message: "Review saved successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to save review"
        });
    }
};

module.exports = {
    getProducts,
    addProductReview,
    createProduct,
    updateProduct,
    deleteProduct
};
