import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductCard({ product, addToCart }) {
  const addWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");

    if (saved.some(p => p._id === product._id)) {
      alert("Already in wishlist");
      return;
    }

    localStorage.setItem("wishlist", JSON.stringify([...saved, product]));
    window.dispatchEvent(new Event("wishlistUpdated"));
    alert("Added to wishlist");
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-image">
        <img src={product.image || "https://placehold.co/500x400"}
          alt={product.name} />
      </Link>

      <div className="product-info">
        <small>{product.category}</small>
        <h3>{product.name}</h3>
        <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
        <p className="stock">
          {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
        </p>

        <button className="primary-btn"
          disabled={product.stock < 1}
          onClick={() => addToCart(product)}>
          <ShoppingCart size={17} /> Add to Cart
        </button>

        <button className="wishlist-btn" onClick={addWishlist}>
          <Heart size={17} /> Wishlist
        </button>
      </div>
    </article>
  );
}
