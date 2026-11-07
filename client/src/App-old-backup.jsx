import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
    const [products, setProducts] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: ""
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    // REVIEW_FEATURE_START
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    // REVIEW_FEATURE_END

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("shopeaseWishlist")) || [];
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showCheckout, setShowCheckout] = useState(false);
    const [orders, setOrders] = useState([]);
    const [authMode, setAuthMode] = useState("login");
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("shopeaseUser")) || null;
        } catch {
            return null;
        }
    });
    const [authData, setAuthData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [orderEmail, setOrderEmail] = useState("");
    const [checkoutData, setCheckoutData] = useState({
        name: "",
        email: "",
        address: ""
    });

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: ""
    });

    const [adminStats, setAdminStats] = useState(null);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState("");
    const [adminOrders, setAdminOrders] = useState([]);
    const [adminCustomers, setAdminCustomers] = useState([]);
    const [adminDataLoading, setAdminDataLoading] = useState(false);

    const handleAuthChange = (event) => {
        const { name, value } = event.target;
        setAuthData((current) => ({ ...current, [name]: value }));
    };

    const handleAuthSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        const endpoint = authMode === "register" ? "register" : "login";

        try {
            const response = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(authData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Authentication failed");
            }

            localStorage.setItem("shopeaseToken", data.token);
            localStorage.setItem("shopeaseUser", JSON.stringify(data.user));

            setUser(data.user);
            setAuthData({ name: "", email: "", password: "" });
            setMessage(data.message);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("shopeaseToken");
        localStorage.removeItem("shopeaseUser");
        setUser(null);
        setMessage("You have logged out successfully.");
    };

    // Submit product review
    const submitProductReview = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("shopeaseToken");

        if (!token || !user) {
            setMessage("Please login to submit a review.");
            return;
        }

        try {
            setSubmittingReview(true);

            const response = await fetch(
                `${API_URL}/products/${selectedProduct._id}/reviews`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        rating: reviewRating,
                        comment: reviewComment
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to submit review");
            }

            setSelectedProduct(data.product);
            setReviewComment("");
            setReviewRating(5);
            setMessage(data.message || "Review submitted successfully!");
            await fetchProducts();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load products");
            }

            setProducts(data);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchAdminDashboard = async () => {
        setAdminLoading(true);
        setAdminError("");

        try {
            const response = await fetch(`${API_URL}/admin/dashboard`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load dashboard");
            }

            setAdminStats(data);
        } catch (error) {
            setAdminError(error.message);
        } finally {
            setAdminLoading(false);
        }
    };

    const fetchAdminManagement = async () => {
        setAdminDataLoading(true);
        const headers = {
            Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
        };

        try {
            const [ordersResponse, customersResponse] = await Promise.all([
                fetch(`${API_URL}/admin/orders`, { headers }),
                fetch(`${API_URL}/admin/customers`, { headers })
            ]);

            const [ordersData, customersData] = await Promise.all([
                ordersResponse.json(),
                customersResponse.json()
            ]);

            if (!ordersResponse.ok) {
                throw new Error(ordersData.message || "Unable to load orders");
            }
            if (!customersResponse.ok) {
                throw new Error(customersData.message || "Unable to load customers");
            }

            setAdminOrders(ordersData);
            setAdminCustomers(customersData);
        } catch (error) {
            setAdminError(error.message);
        } finally {
            setAdminDataLoading(false);
        }
    };

    const updateAdminOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(
                `${API_URL}/admin/orders/${orderId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Unable to update order");
            }

            setMessage("Order status updated successfully.");
            await fetchAdminManagement();
            await fetchAdminDashboard();
            await fetchProducts();
        } catch (error) {
            setMessage(error.message);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchAdminDashboard();
            fetchAdminManagement();
        } else {
            setAdminStats(null);
            setAdminError("");
            setAdminOrders([]);
            setAdminCustomers([]);
        }
    }, [user]);

    const handleProductChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleProductSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to add product");
            }

            setFormData({
                name: "",
                price: "",
                category: "",
                stock: "",
                image: ""
            });
            setMessage("Product added successfully!");
            await fetchProducts();
        } catch (error) {
            setMessage(error.message);
        }
    };

    const startEditing = (product) => {
        setEditingProductId(product._id);
        setEditData({
            name: product.name || "",
            description: product.description || "",
            price: product.price,
            category: product.category || "",
            stock: product.stock,
            image: product.image || ""
        });
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditData((current) => ({ ...current, [name]: value }));
    };

    const saveProduct = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${API_URL}/products/${editingProductId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                },
                body: JSON.stringify({
                    ...editData,
                    price: Number(editData.price),
                    stock: Number(editData.stock)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update product");
            }

            setEditingProductId(null);
            setMessage("Product updated successfully!");
            await fetchProducts();
        } catch (error) {
            setMessage(error.message);
        }
    };

    const deleteProduct = async (productId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`${API_URL}/products/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete product");
            }

            setCart((current) =>
                current.filter((item) => item._id !== productId)
            );

            setMessage("Product deleted successfully!");
            await fetchProducts();
        } catch (error) {
            setMessage(error.message);
        }
    };

    const addToCart = (product) => {
        if (product.stock < 1) {
            setMessage("This product is out of stock.");
            return;
        }

        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item._id === product._id
            );

            if (existingItem) {
                return currentCart.map((item) =>
                    item._id === product._id
                        ? {
                              ...item,
                              quantity: Math.min(item.quantity + 1, product.stock)
                          }
                        : item
                );
            }

            return [...currentCart, { ...product, quantity: 1 }];
        });

        setMessage("");
    };

    const updateQuantity = (productId, change) => {
        setCart((currentCart) =>
            currentCart
                .map((item) => {
                    if (item._id !== productId) return item;

                    return {
                        ...item,
                        quantity: Math.min(item.quantity + change, item.stock)
                    };
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId) => {
        setCart((currentCart) =>
            currentCart.filter((item) => item._id !== productId)
        );
    };

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const handleCheckoutChange = (event) => {
        const { name, value } = event.target;
        setCheckoutData((current) => ({ ...current, [name]: value }));
    };

    const placeOrder = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                },
                body: JSON.stringify({
                    ...checkoutData,
                    items: cart.map((item) => ({
                        productId: item._id,
                        quantity: item.quantity
                    }))
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to place order");
            }

            setMessage(`Order placed! Order ID: ${data.order._id}`);
            setCart([]);
            setShowCheckout(false);
            setOrderEmail(checkoutData.email);
            setCheckoutData({ name: "", email: "", address: "" });
            await fetchOrders(checkoutData.email);
            await fetchProducts();
        } catch (error) {
            setMessage(error.message);
        }
    };

    const fetchOrders = async (email) => {
        if (!email.trim()) {
            setMessage("Enter your email to view order history.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/orders?email=${encodeURIComponent(email.trim())}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("shopeaseToken")}`
                    }
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load order history");
            }

            setOrders(data);
            setOrderEmail(email.trim());
        } catch (error) {
            setMessage(error.message);
        }
    };

    const categories = [
        "All",
        ...new Set(products.map((product) => product.category).filter(Boolean))
    ];

    // WISHLIST_FEATURE_START
    const toggleWishlist = (product) => {
        setWishlist((current) => {
            const exists = current.some((item) => item._id === product._id);
            const updated = exists
                ? current.filter((item) => item._id !== product._id)
                : [...current, product];

            localStorage.setItem("shopeaseWishlist", JSON.stringify(updated));
            setMessage(exists ? "Removed from wishlist." : "Added to wishlist.");
            return updated;
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlist((current) => {
            const updated = current.filter((item) => item._id !== productId);
            localStorage.setItem("shopeaseWishlist", JSON.stringify(updated));
            return updated;
        });
    };
    // WISHLIST_FEATURE_END

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            categoryFilter === "All" ||
            product.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    return (
        <main>
            <header className="header">
                <div>
                    <h1>ShopEase</h1>
                    <p>Find your everyday essentials.</p>
                </div>

                <div className="header-actions">
                    <a href="#wishlist" className="cart-link">
                        Wishlist ({wishlist.length})
                    </a>
                    <a href="#cart" className="cart-link">
                        Cart ({cartCount})
                    </a>
                </div>
            </header>

            {user?.role === "admin" && (
                <section className="admin-dashboard">
                    <div className="admin-heading">
                        <div>
                            <p className="admin-eyebrow">ADMIN PANEL</p>
                            <h2>Dashboard Overview</h2>
                            <p>ShopEase store performance at a glance.</p>
                        </div>
                        <button type="button" onClick={fetchAdminDashboard}>
                            Refresh Dashboard
                        </button>
                    </div>

                    {adminLoading && <p>Loading dashboard...</p>}
                    {adminError && <p className="message">{adminError}</p>}

                    {adminStats && (
                        <>
                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <span>Total Products</span>
                                    <strong>{adminStats.totalProducts}</strong>
                                </div>
                                <div className="admin-stat-card">
                                    <span>Total Orders</span>
                                    <strong>{adminStats.totalOrders}</strong>
                                </div>
                                <div className="admin-stat-card">
                                    <span>Total Users</span>
                                    <strong>{adminStats.totalUsers}</strong>
                                </div>
                                <div className="admin-stat-card">
                                    <span>Total Revenue</span>
                                    <strong>₹{Number(adminStats.totalRevenue || 0).toLocaleString("en-IN")}</strong>
                                </div>
                            </div>

                            <div className="admin-management-grid">
                        <div className="admin-management-panel">
                            <h3>Order Management</h3>
                            {adminDataLoading && <p>Loading orders...</p>}
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminOrders.map((order) => (
                                            <tr key={order._id}>
                                                <td>
                                                    {order.customer?.name || "Customer"}
                                                    <small className="admin-subtext">
                                                        {order.customer?.email || ""}
                                                    </small>
                                                </td>
                                                <td>₹{order.totalAmount}</td>
                                                <td>{order.status}</td>
                                                <td>
                                                    <select
                                                        value={order.status}
                                                        disabled={order.status === "Cancelled"}
                                                        onChange={(event) =>
                                                            updateAdminOrderStatus(
                                                                order._id,
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        <option value="Placed">Placed</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {adminOrders.length === 0 && <p>No orders found.</p>}
                        </div>

                        <div className="admin-management-panel">
                            <h3>Customer Management</h3>
                            <p>Total registered customers: {adminCustomers.length}</p>
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminCustomers.map((customer) => (
                                            <tr key={customer._id}>
                                                <td>{customer.name}</td>
                                                <td>{customer.email}</td>
                                                <td>
                                                    {customer.createdAt
                                                        ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {adminCustomers.length === 0 && <p>No customers found.</p>}
                        </div>
                    </div>

                    <div className="admin-recent-orders">
                                <h3>Recent Orders</h3>
                                {adminStats.recentOrders?.length ? (
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Customer</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminStats.recentOrders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>{order.customer?.name || "Customer"}</td>
                                                        <td>₹{order.totalAmount}</td>
                                                        <td>{order.status}</td>
                                                        <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No orders available yet.</p>
                                )}
                            </div>
                        </>
                    )}
                </section>
            )}

            <section className="add-product">
                {user ? (
                    <div>
                        <h2>Welcome, {user.name}!</h2>
                        <p>{user.email}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <>
                        <h2>{authMode === "register" ? "Create Account" : "Login"}</h2>

                        <form onSubmit={handleAuthSubmit}>
                            {authMode === "register" && (
                                <input
                                    name="name"
                                    placeholder="Full name"
                                    value={authData.name}
                                    onChange={handleAuthChange}
                                    required
                                />
                            )}

                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={authData.email}
                                onChange={handleAuthChange}
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password (minimum 6 characters)"
                                value={authData.password}
                                onChange={handleAuthChange}
                                minLength={6}
                                required
                            />

                            <button type="submit">
                                {authMode === "register" ? "Sign Up" : "Login"}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => {
                                setAuthMode(authMode === "login" ? "register" : "login");
                                setMessage("");
                            }}
                        >
                            {authMode === "login"
                                ? "Create a new account"
                                : "Already have an account? Login"}
                        </button>
                    </>
                )}
            </section>

            {user?.role === "admin" && (
            <section className="add-product">
                <h2>Add New Product</h2>
                <form onSubmit={handleProductSubmit}>
                    <input
                        name="name"
                        placeholder="Product name"
                        value={formData.name}
                        onChange={handleProductChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        min="0"
                        value={formData.price}
                        onChange={handleProductChange}
                        required
                    />
                    <input
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleProductChange}
                        required
                    />
                    <input
                        type="number"
                        name="stock"
                        placeholder="Stock quantity"
                        min="0"
                        value={formData.stock}
                        onChange={handleProductChange}
                        required
                    />
                    <input
                        type="url"
                        name="image"
                        placeholder="Product image URL (optional)"
                        value={formData.image}
                        onChange={handleProductChange}
                    />
                    <button type="submit">Add Product</button>
                </form>
            </section>
            )}

            {message && <p className="message">{message}</p>}

            <section>
                <h2>Our Products</h2>

                <div className="product-filters">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />

                    <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div className="product-list">
                        {filteredProducts.map((product) => (
                            <article key={product._id} className="product-card">
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                )}
                                <h3>{product.name}</h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    View Details
                                </button>
                                <p>{product.category}</p>
                                <p className="price">₹{product.price}</p>
                                <p>Stock: {product.stock}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock < 1}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleWishlist(product)}
                                >
                                    {wishlist.some(item => item._id === product._id)
                                        ? "♥ Remove Wishlist"
                                        : "♡ Add to Wishlist"}
                                </button>

                                {user?.role === "admin" && (
                                    <div className="product-admin-actions">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(product)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="remove-button"
                                            onClick={() => deleteProduct(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}

                                {user?.role === "admin" && editingProductId === product._id && (
                                    <form className="edit-product-form" onSubmit={saveProduct}>
                                        <h3>Edit Product</h3>

                                        <input
                                            name="name"
                                            placeholder="Product name"
                                            value={editData.name}
                                            onChange={handleEditChange}
                                            required
                                        />

                                        <textarea
                                            name="description"
                                            placeholder="Product description"
                                            value={editData.description}
                                            onChange={handleEditChange}
                                        />

                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="Price"
                                            min="0"
                                            value={editData.price}
                                            onChange={handleEditChange}
                                            required
                                        />

                                        <input
                                            name="category"
                                            placeholder="Category"
                                            value={editData.category}
                                            onChange={handleEditChange}
                                        />

                                        <input
                                            type="number"
                                            name="stock"
                                            placeholder="Stock"
                                            min="0"
                                            value={editData.stock}
                                            onChange={handleEditChange}
                                            required
                                        />

                                        <input
                                            type="url"
                                            name="image"
                                            placeholder="Image URL"
                                            value={editData.image}
                                            onChange={handleEditChange}
                                        />

                                        <button type="submit">Save Changes</button>

                                        <button
                                            type="button"
                                            onClick={() => setEditingProductId(null)}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <p>No products found.</p>
                )}
            </section>

            {selectedProduct && (
                <section className="product-details">
                    <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                    >
                        Close Details
                    </button>

                    <div className="details-layout">
                        {selectedProduct.image && (
                            <img
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                className="details-image"
                            />
                        )}

                        <div>
                            <h2>{selectedProduct.name}</h2>
                            <p>{selectedProduct.category}</p>

                            <h2>₹{selectedProduct.price}</h2>

                            <p>
                                {selectedProduct.description ||
                                    "No description available."}
                            </p>

                            <p>
                                Available Stock: {selectedProduct.stock}
                            </p>

                            <button
                                onClick={() => addToCart(selectedProduct)}
                                disabled={selectedProduct.stock < 1}
                            >
                                Add to Cart
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleWishlist(selectedProduct)}
                            >
                                {wishlist.some(item => item._id === selectedProduct._id)
                                    ? "♥ Remove Wishlist"
                                    : "♡ Add to Wishlist"}
                            </button>
                        </div>
                    </div>

                    {/* REVIEW_FEATURE_START */}
                    <div className="reviews-section">
                        <h2>Customer Reviews</h2>

                        <div className="product-rating">
                            <strong>
                                {Number(selectedProduct.averageRating || 0).toFixed(1)} / 5
                            </strong>
                            <span className="rating-stars">
                                {"★".repeat(Math.round(selectedProduct.averageRating || 0))}
                                {"☆".repeat(5 - Math.round(selectedProduct.averageRating || 0))}
                            </span>
                            <span>
                                ({selectedProduct.numReviews || 0} reviews)
                            </span>
                        </div>

                        <form className="review-form" onSubmit={submitProductReview}>
                            <h3>Write a Review</h3>

                            {!user ? (
                                <p>Please login to write a review.</p>
                            ) : (
                                <>
                                    <label>Your Rating</label>
                                    <div className="rating-picker">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={star <= reviewRating ? "star active" : "star"}
                                                onClick={() => setReviewRating(star)}
                                                aria-label={`${star} star rating`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={reviewComment}
                                        onChange={(event) => setReviewComment(event.target.value)}
                                        placeholder="Share your experience with this product..."
                                        maxLength={1000}
                                        rows={4}
                                    />

                                    <button type="submit" disabled={submittingReview}>
                                        {submittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </>
                            )}
                        </form>

                        <div className="reviews-list">
                            {(selectedProduct.reviews || []).length === 0 ? (
                                <p>No reviews yet. Be the first to review!</p>
                            ) : (
                                [...selectedProduct.reviews].reverse().map((review, index) => (
                                    <article className="review-item" key={review._id || index}>
                                        <div className="review-heading">
                                            <strong>{review.name}</strong>
                                            <span className="rating-stars">
                                                {"★".repeat(review.rating)}
                                                {"☆".repeat(5 - review.rating)}
                                            </span>
                                        </div>
                                        <p>{review.comment || "No written comment."}</p>
                                        <small>
                                            {review.createdAt
                                                ? new Date(review.createdAt).toLocaleDateString()
                                                : ""}
                                        </small>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                    {/* REVIEW_FEATURE_END */}
                </section>
            )}

            <section id="wishlist" className="wishlist-section">
                <h2>My Wishlist ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                    <p>Your wishlist is empty.</p>
                ) : (
                    <div className="product-list">
                        {wishlist.map((item) => (
                            <article key={item._id} className="product-card">
                                {item.image && (
                                    <img src={item.image} alt={item.name}
                                        className="product-image" />
                                )}
                                <h3>{item.name}</h3>
                                <p>₹{item.price}</p>
                                <button type="button"
                                    onClick={() => {
                                        const latest = products.find(p => p._id === item._id) || item;
                                        addToCart(latest);
                                    }}>
                                    Add to Cart
                                </button>
                                <button type="button"
                                    onClick={() => removeFromWishlist(item._id)}>
                                    Remove
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section id="cart" className="cart-section">
                <h2>Your Shopping Cart ({cartCount})</h2>

                {cart.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        {cart.map((item) => (
                            <article key={item._id} className="cart-item">
                                <div>
                                    <h3>{item.name}</h3>
                                    <p>₹{item.price} each</p>
                                    <p>Subtotal: ₹{item.price * item.quantity}</p>
                                </div>

                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(item._id, -1)}>
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                    <button
                                        className="remove-button"
                                        onClick={() => removeFromCart(item._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}

                        <div className="cart-total">
                            <h3>Total: ₹{cartTotal}</h3>
                            <button
                                onClick={() => {
                                    setMessage("");
                                    setShowCheckout(true);
                                }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </section>

            {showCheckout && (
                <section className="add-product">
                    <h2>Checkout</h2>
                    <form onSubmit={placeOrder}>
                        <input
                            name="name"
                            placeholder="Full name"
                            value={checkoutData.name}
                            onChange={handleCheckoutChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={checkoutData.email}
                            onChange={handleCheckoutChange}
                            required
                        />
                        <textarea
                            name="address"
                            placeholder="Delivery address"
                            value={checkoutData.address}
                            onChange={handleCheckoutChange}
                            required
                        />
                        <p>Order total: ₹{cartTotal}</p>
                        <button type="submit">Place Order</button>
                        <button
                            type="button"
                            onClick={() => setShowCheckout(false)}
                        >
                            Cancel
                        </button>
                    </form>
                </section>
            )}

            <section className="cart-section">
                <h2>Order History</h2>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        fetchOrders(orderEmail);
                    }}
                >
                    <input
                        type="email"
                        placeholder="Enter the email used for your order"
                        value={orderEmail}
                        onChange={(event) => setOrderEmail(event.target.value)}
                        required
                    />
                    <button type="submit">View Orders</button>
                </form>

                {orders.map((order) => (
                    <article key={order._id} className="cart-item">
                        <div>
                            <h3>Order ID: {order._id}</h3>
                            <p>Status: <strong>{order.status}</strong></p>
                            <p>{new Date(order.createdAt).toLocaleString()}</p>

                            {/* ORDER_TRACKING_FEATURE */}
                            {order.status === "Cancelled" ? (
                                <p className="tracking-cancelled">✕ Order Cancelled</p>
                            ) : (
                                <div className="order-tracking">
                                    {["Placed", "Shipped", "Delivered"].map((step, index) => {
                                        const stages = ["Placed", "Shipped", "Delivered"];
                                        const current = stages.indexOf(order.status);
                                        const completed = index <= current;

                                        return (
                                            <div
                                                key={step}
                                                className={`tracking-step ${completed ? "completed" : ""}`}
                                            >
                                                <span className="tracking-dot">
                                                    {completed ? "✓" : index + 1}
                                                </span>
                                                <span>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {/* ORDER_TRACKING_FEATURE_END */}
                            {order.items.map((item, index) => (
                                <p key={`${order._id}-${index}`}>
                                    {item.name} × {item.quantity} — ₹
                                    {item.price * item.quantity}
                                </p>
                            ))}
                            <strong>Total: ₹{order.totalAmount}</strong>
                        </div>
                    </article>
                ))}

                {orders.length === 0 && (
                    <p>Enter your order email to check your order history.</p>
                )}
            </section>
        </main>
    );
}

export default App;
