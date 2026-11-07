require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");

const products = [
  {
    name: "Samsung Galaxy Smartphone",
    category: "Mobiles",
    price: 18999,
    stock: 25,
    description: "Powerful smartphone with stunning display and long battery life.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"
  },
  {
    name: "Apple iPhone Premium",
    category: "Mobiles",
    price: 69999,
    stock: 12,
    description: "Premium smartphone with advanced camera and performance.",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600"
  },
  {
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    stock: 40,
    description: "Comfortable wireless headphones with rich sound.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
  },
  {
    name: "Smart Watch",
    category: "Electronics",
    price: 3299,
    stock: 30,
    description: "Smart watch with fitness tracking and notifications.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
  },
  {
    name: "Men Casual T-Shirt",
    category: "Men's Clothing",
    price: 599,
    stock: 50,
    description: "Comfortable everyday casual cotton T-shirt.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"
  },
  {
    name: "Men Denim Jacket",
    category: "Men's Clothing",
    price: 1799,
    stock: 20,
    description: "Classic denim jacket for everyday style.",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600"
  },
  {
    name: "Women's Fashion Dress",
    category: "Women's Clothing",
    price: 1299,
    stock: 25,
    description: "Elegant women's dress for casual and special occasions.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"
  },
  {
    name: "Women's Handbag",
    category: "Women's Clothing",
    price: 1499,
    stock: 18,
    description: "Stylish handbag with spacious storage.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
  },
  {
    name: "Running Sports Shoes",
    category: "Shoes",
    price: 2199,
    stock: 35,
    description: "Lightweight running shoes with comfortable cushioning.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    name: "Classic Sneakers",
    category: "Shoes",
    price: 1899,
    stock: 28,
    description: "Everyday sneakers with a modern design.",
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=600"
  },
  {
    name: "Modern Table Lamp",
    category: "Home & Kitchen",
    price: 999,
    stock: 22,
    description: "Minimal modern table lamp for your home.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"
  },
  {
    name: "Coffee Maker",
    category: "Home & Kitchen",
    price: 2799,
    stock: 15,
    description: "Convenient coffee maker for your morning routine.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
  },
  {
    name: "Skincare Essentials",
    category: "Beauty",
    price: 799,
    stock: 45,
    description: "Daily skincare essentials for your beauty routine.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600"
  },
  {
    name: "Perfume Collection",
    category: "Beauty",
    price: 1199,
    stock: 30,
    description: "Elegant fragrance collection for everyday use.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600"
  },
  {
    name: "Classic Sunglasses",
    category: "Accessories",
    price: 899,
    stock: 40,
    description: "Classic sunglasses with a timeless design.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
  },
  {
    name: "Premium Wrist Watch",
    category: "Accessories",
    price: 2499,
    stock: 20,
    description: "Premium wrist watch with an elegant finish.",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600"
  },
  {
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 1599,
    stock: 32,
    description: "Portable speaker with powerful audio.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
  },
  {
    name: "Laptop Backpack",
    category: "Accessories",
    price: 1199,
    stock: 25,
    description: "Spacious backpack for laptop and everyday essentials.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
  }
];

async function seedProducts() {
  try {
    await connectDB();

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const result = await Product.updateOne(
        { name: product.name },
        { $setOnInsert: product },
        { upsert: true }
      );

      if (result.upsertedCount > 0) added++;
      else skipped++;
    }

    console.log("\nShopEase product seeding completed!");
    console.log("New products added:", added);
    console.log("Existing products skipped:", skipped);
    console.log("Total sample products:", products.length);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedProducts();
