import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  const loadWishlist = () => {
    setItems(JSON.parse(localStorage.getItem("wishlist") || "[]"));
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener("wishlistUpdated", loadWishlist);
    return () => window.removeEventListener("wishlistUpdated", loadWishlist);
  }, []);

  const remove = id => {
    const updated = items.filter(item => item._id !== id);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setItems(updated);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <main className="page-container">
      <h2>My Wishlist ❤️</h2>

      {items.length === 0 ? (
        <p className="empty">Your wishlist is empty.</p>
      ) : (
        <div className="product-grid">
          {items.map(item => (
            <article className="product-card" key={item._id}>
              <Link to={`/product/${item._id}`} className="product-image">
                <img src={item.image || "https://placehold.co/500x400"}
                  alt={item.name} />
              </Link>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price.toLocaleString("en-IN")}</p>
                <button className="wishlist-btn" onClick={() => remove(item._id)}>
                  <Trash2 size={17} /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
