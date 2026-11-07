import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import api from "../api";

export default function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError("Product not found"));
  }, [id]);

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const exists = saved.some(p => p._id === product._id);
    const updated = exists
      ? saved.filter(p => p._id !== product._id)
      : [...saved, product];

    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
    alert(exists ? "Removed from wishlist" : "Added to wishlist");
  };

  if (error) return <main className="page-container">{error}</main>;
  if (!product) return <main className="page-container">Loading...</main>;

  const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
  const isSaved = saved.some(p => p._id === product._id);

  return (
    <main className="details-page">
      <div className="details-image">
        <img src={product.image || "https://placehold.co/500x400"}
          alt={product.name} />
      </div>

      <div className="details-info">
        <small>{product.category}</small>
        <h1>{product.name}</h1>
        <h2>₹{product.price.toLocaleString("en-IN")}</h2>
        <p>{product.description}</p>
        <p>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

        <button className="primary-btn"
          disabled={product.stock < 1}
          onClick={() => addToCart(product)}>
          <ShoppingCart size={18} /> Add to Cart
        </button>

        <button className="wishlist-btn" onClick={toggleWishlist}>
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
          {isSaved ? "Remove Wishlist" : "Add to Wishlist"}
        </button>
      </div>
    </main>
  );
}
