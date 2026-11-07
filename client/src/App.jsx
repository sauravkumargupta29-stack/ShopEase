import { useEffect, useState } from "react";

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
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Mobiles");
    const [sortBy, setSortBy] = useState("featured");
    const [stockOnly, setStockOnly] = useState(false);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("0");

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
        "Mobiles", "Electronics", "Fashion", "Men's Clothing",
        "Women's Clothing", "Shoes", "Home & Kitchen", "Beauty", "Accessories"
    ];

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

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            product.category?.toLowerCase().includes(categoryFilter.toLowerCase());

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');

                #root {
                    width: 100%;
                    max-width: none;
                    margin: 0;
                    padding: 0;
                }

                body {
                    margin: 0;
                    background: #f4f7fb;
                    color: #1b2d48;
                    font-family: 'DM Sans', sans-serif;
                }

                .se-app {
                    min-height: 100vh;
                }

                .se-app * {
                    box-sizing: border-box;
                }

                .se-top {
                    background: #102c54;
                    color: #dce9f8;
                    text-align: center;
                    padding: 7px;
                    font-size: 11px;
                    letter-spacing: .7px;
                }

                .se-head {
                    background: #fff;
                    display: flex;
                    align-items: center;
                    gap: 28px;
                    padding: 17px max(calc((100% - 1240px)/2), 4%);
                    box-shadow: 0 3px 16px #102c5410;
                }

                .se-brand {
                    font: 800 26px Manrope;
                    color: #12345e;
                    white-space: nowrap;
                }

                .se-brand span {
                    color: #f18c43;
                }

                .se-search {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    background: #f0f5fc;
                    border: 1px solid #e2eaf5;
                    border-radius: 8px;
                    padding: 0 12px;
                    height: 44px;
                    flex: 1;
                }

                .se-search input {
                    border: 0 !important;
                    background: transparent !important;
                    outline: 0;
                    box-shadow: none !important;
                    flex: 1;
                    min-width: 0;
                }

                .se-search button,
                .se-head-actions button {
                    border: 0;
                    background: none;
                    color: #17599e;
                    font-weight: 700;
                    cursor: pointer;
                }

                .se-head-actions {
                    display: flex;
                    gap: 12px;
                    white-space: nowrap;
                }

                .se-head-actions a {
                    color: #17365c;
                    text-decoration: none;
                    font-size: 12px;
                    font-weight: 700;
                }

                .se-nav {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                    overflow: auto;
                    background: #fff;
                    padding: 0 15px;
                    border-top: 1px solid #eef1f5;
                }

                .se-nav button {
                    background: none;
                    border: 0;
                    border-bottom: 3px solid transparent;
                    padding: 14px 3px;
                    color: #5e6f86;
                    font-weight: 700;
                    font-size: 11px;
                    white-space: nowrap;
                    cursor: pointer;
                }

                .se-nav button.active {
                    color: #17599e;
                    border-color: #f18c43;
                }

                .se-wrap {
                    max-width: 1240px;
                    margin: auto;
                    padding: 24px 22px 55px;
                }

                .se-hero {
                    background: linear-gradient(110deg, #102c54, #1c5794 70%, #2878bd);
                    border-radius: 16px;
                    color: #fff;
                    padding: 42px 5%;
                    min-height: 280px;
                    display: flex;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .se-hero:after {
                    content: 'S';
                    position: absolute;
                    right: 9%;
                    font: 800 240px Manrope;
                    color: #ffffff12;
                    transform: rotate(-12deg);
                }

                .se-hero small,
                .se-eyebrow {
                    color: #f5a05d;
                    letter-spacing: 2px;
                    font-size: 10px;
                    font-weight: 800;
                }

                .se-hero h1 {
                    color: #ffffff;
                    font: 800 clamp(30px, 4vw, 46px)/1.15 Manrope;
                    margin: 12px 0;
                    letter-spacing: -1px;
                }

                .se-hero h1 span {
                    color: #ffb875;
                }

                .se-hero p {
                    font-size: 13px;
                    color: #d4e3f5;
                    margin-bottom: 22px;
                }

                .se-btn {
                    border: 0;
                    border-radius: 7px;
                    background: #f69a4c;
                    color: #16345a;
                    padding: 12px 18px;
                    font-weight: 800;
                    font-size: 11px;
                    cursor: pointer;
                }

                .se-benefits {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    background: #fff;
                    border: 1px solid #e8edf4;
                    border-radius: 11px;
                    padding: 17px;
                    margin: 17px 0 36px;
                }

                .se-benefits div {
                    font-size: 11px;
                    font-weight: 700;
                    color: #253e5d;
                }

                .se-benefits span {
                    display: block;
                    color: #8b98aa;
                    font-size: 9px;
                    font-weight: 400;
                    margin-top: 4px;
                }

                .se-section-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                    margin: 28px 0 15px;
                    gap: 12px;
                }

                .se-section-title h2 {
                    font: 800 24px Manrope;
                    margin: 5px 0;
                    color: #1b3558;
                }

                .se-section-title p {
                    font-size: 11px;
                    color: #8491a4;
                    margin: 0;
                }

                .se-panel {
                    background: #fff;
                    border: 1px solid #e8edf4;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                }

                .se-panel h2,
                .se-panel h3 {
                    color: #1b3558;
                }

                .se-products {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 14px;
                }

                .se-card {
                    position: relative;
                    background: #fff;
                    border: 1px solid #e8edf4;
                    border-radius: 10px;
                    padding: 0 0 12px;
                    overflow: hidden;
                    transition: .2s;
                }

                .se-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 25px #19385b15;
                }

                .se-card img {
                    width: 100%;
                    height: 165px;
                    object-fit: contain;
                    padding: 15px;
                    background: #fff;
                    border-bottom: 1px solid #f0f2f6;
                }

                .se-card-body {
                    padding: 11px 12px;
                }

                .se-card h3 {
                    font-size: 12px;
                    min-height: 32px;
                    margin: 0 0 6px;
                    color: #263954;
                }

                .se-card p {
                    font-size: 10px;
                    color: #8794a7;
                    margin: 5px 0;
                }

                .se-price {
                    font-size: 15px !important;
                    color: #18375c !important;
                    font-weight: 800;
                }

                .se-card button,
                .se-panel button,
                .se-app form button,
                .se-app .cart-link {
                    cursor: pointer;
                }

                .se-card button {
                    border: 0;
                    border-radius: 6px;
                    background: #175da9;
                    color: #fff;
                    padding: 9px 11px;
                    font-size: 10px;
                    font-weight: 800;
                    margin: 5px 4px 0 0;
                }

                .se-card .se-light {
                    background: #edf4fc;
                    color: #175da9;
                }

                .se-card .se-danger {
                    background: #fff0f0;
                    color: #c34f5c;
                }

                .se-app input,
                .se-app textarea,
                .se-app select {
                    border: 1px solid #dfe7f0;
                    border-radius: 7px;
                    padding: 10px 11px;
                    background: #fff;
                    color: #253b59;
                    font: 12px 'DM Sans', sans-serif;
                    max-width: 100%;
                }

                .se-app form {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 9px;
                    align-items: center;
                }

                .se-app form input,
                .se-app form textarea {
                    flex: 1;
                    min-width: 150px;
                }

                .se-app form button,
                .se-app .se-panel > button,
                .se-app .cart-total button {
                    border: 0;
                    border-radius: 6px;
                    background: #175da9;
                    color: white;
                    padding: 10px 14px;
                    font-size: 11px;
                    font-weight: 800;
                }

                .se-message {
                    background: #edf6ff;
                    border: 1px solid #d8e9fb;
                    color: #17518b;
                    border-radius: 8px;
                    padding: 11px 14px;
                    font-size: 12px;
                    margin: 15px 0;
                }

                .se-admin-grid,
                .se-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                .se-stat {
                    background: #f4f8fd;
                    border: 1px solid #e6edf6;
                    border-radius: 9px;
                    padding: 15px;
                }

                .se-stat span {
                    display: block;
                    color: #718198;
                    font-size: 10px;
                }

                .se-stat strong {
                    display: block;
                    font: 800 22px Manrope;
                    color: #17365d;
                    margin-top: 5px;
                }

                .se-table-wrap {
                    overflow: auto;
                }

                .se-app table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                .se-app th,
                .se-app td {
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid #edf0f5;
                }

                .se-app th {
                    color: #61728a;
                    background: #f7f9fc;
                }

                .se-cart-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    align-items: center;
                    border-bottom: 1px solid #edf0f5;
                    padding: 13px 0;
                }

                .se-cart-row h3 {
                    font-size: 13px;
                    margin: 0 0 5px;
                }

                .se-cart-row p {
                    font-size: 11px;
                    color: #738198;
                    margin: 4px 0;
                }

                .se-cart-row button {
                    border: 1px solid #dce5ef;
                    background: #fff;
                    color: #175da9;
                    border-radius: 5px;
                    padding: 5px 9px;
                    margin: 0 3px;
                }

                .se-details {
                    border: 1px solid #dfe8f2;
                    border-radius: 12px;
                    background: #fff;
                    padding: 20px;
                    margin: 18px 0;
                }

                .se-details img {
                    max-width: 190px;
                    max-height: 190px;
                    object-fit: contain;
                    float: left;
                    margin: 0 22px 12px 0;
                }

                .se-review {
                    border-top: 1px solid #edf0f5;
                    padding: 12px 0;
                    font-size: 12px;
                }

                .se-stars {
                    color: #e99a31;
                    font-size: 17px;
                }

                .se-tracking {
                    display: flex;
                    gap: 12px;
                    margin: 12px 0;
                }

                .se-tracking span {
                    background: #edf2f7;
                    border-radius: 20px;
                    padding: 6px 11px;
                    font-size: 10px;
                    color: #718198;
                }

                .se-tracking .done {
                    background: #e4f5eb;
                    color: #21804a;
                }

                .se-footer {
                    background: #102c54;
                    color: #d6e3f2;
                    padding: 30px max(calc((100% - 1200px)/2), 5%);
                    font-size: 10px;
                }

                @media (max-width: 850px) {
                    .se-products {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }

                    .se-head {
                        gap: 12px;
                        padding: 14px 3%;
                    }

                    .se-admin-grid,
                    .se-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .se-head {
                        flex-wrap: wrap;
                    }

                    .se-brand {
                        font-size: 22px;
                    }

                    .se-search {
                        order: 3;
                        flex-basis: 100%;
                    }

                    .se-head-actions {
                        margin-left: auto;
                    }

                    .se-nav {
                        justify-content: flex-start;
                        gap: 16px;
                    }

                    .se-wrap {
                        padding: 14px 11px 35px;
                    }

                    .se-hero {
                        min-height: 250px;
                        padding: 28px 20px;
                    }

                    .se-hero h1 {
                        font-size: 30px;
                    }

                    .se-benefits {
                        grid-template-columns: repeat(2, 1fr);
                        padding: 12px;
                    }

                    .se-products {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 8px;
                    }

                    .se-card img {
                        height: 130px;
                        padding: 10px;
                    }

                    .se-card-body {
                        padding: 8px;
                    }

                    .se-card h3 {
                        font-size: 10px;
                    }

                    .se-card button {
                        font-size: 9px;
                        padding: 8px 7px;
                    }

                    .se-section-title {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .se-details img {
                        float: none;
                        display: block;
                        margin: auto;
                    }

                    .se-admin-grid,
                    .se-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .se-cart-row {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="se-app">
                <div className="se-top">
                    SHOP SMART. LIVE BETTER.　·　Discover everyday favourites
                </div>

                <header className="se-head">
                    <div className="se-brand">
                        Shop<span>Ease</span>
                    </div>

                    <div className="se-search">
                        <span>⌕</span>
                        <input
                            placeholder="Search products and brands..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="se-head-actions">
                        <a href="#wishlist">♡ Wishlist ({wishlist.length})</a>
                        <a href="#cart">▣ Cart ({cartCount})</a>
                        {user && (
                            <button onClick={handleLogout}>Logout</button>
                        )}
                    </div>
                </header>

                <nav className="se-nav">
                    {categories.map((c) => (
                        <button
                            key={c}
                            className={categoryFilter === c ? "active" : ""}
                            onClick={() => setCategoryFilter(c)}
                        >
                            {c}
                        </button>
                    ))}
                </nav>

                <main className="se-wrap">
                    <section className="se-hero">
                        <div>
                            <small>THE EVERYDAY SHOPPING FEST</small>

                            <h1>
                                Everything you love.
                                <br />
                                <span>At prices you'll love.</span>
                            </h1>

                            <p>
                                Discover your everyday favourites across fashion,
                                tech and lifestyle.
                            </p>

                            <button
                                className="se-btn"
                                onClick={() =>
                                    document
                                        .getElementById("products")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                            >
                                Explore products　→
                            </button>
                        </div>
                    </section>

                    <section className="se-benefits">
                        <div>
                            🚚　Free delivery
                            <span>On your favourite finds</span>
                        </div>

                        <div>
                            🔒　Safe shopping
                            <span>Secure account experience</span>
                        </div>

                        <div>
                            ↩　Easy shopping
                            <span>Simple checkout</span>
                        </div>

                        <div>
                            ✦　Daily discoveries
                            <span>Something new to love</span>
                        </div>
                    </section>

                    {user?.role === "admin" && (
                        <section className="se-panel">
                            <div className="se-section-title">
                                <div>
                                    <small className="se-eyebrow">ADMIN PANEL</small>
                                    <h2>Dashboard Overview</h2>
                                </div>

                                <button onClick={fetchAdminDashboard}>
                                    Refresh Dashboard
                                </button>
                            </div>

                            {adminLoading && <p>Loading dashboard...</p>}

                            {adminError && (
                                <p className="se-message">{adminError}</p>
                            )}

                            {adminStats && (
                                <div className="se-stats">
                                    {[
                                        ["Total Products", adminStats.totalProducts],
                                        ["Total Orders", adminStats.totalOrders],
                                        ["Total Users", adminStats.totalUsers],
                                        [
                                            "Total Revenue",
                                            `₹${Number(
                                                adminStats.totalRevenue || 0
                                            ).toLocaleString("en-IN")}`
                                        ]
                                    ].map(([label, value]) => (
                                        <div className="se-stat" key={label}>
                                            <span>{label}</span>
                                            <strong>{value}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="se-section-title">
                                <h2>Order Management</h2>
                            </div>

                            <div className="se-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Update</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {adminOrders.map((o) => (
                                            <tr key={o._id}>
                                                <td>
                                                    {o.customer?.name}
                                                    <br />
                                                    {o.customer?.email}
                                                </td>

                                                <td>₹{o.totalAmount}</td>
                                                <td>{o.status}</td>

                                                <td>
                                                    <select
                                                        value={o.status}
                                                        disabled={o.status === "Cancelled"}
                                                        onChange={(e) =>
                                                            updateAdminOrderStatus(
                                                                o._id,
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option>Placed</option>
                                                        <option>Shipped</option>
                                                        <option>Delivered</option>
                                                        <option>Cancelled</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3>
                                Customer Management ({adminCustomers.length})
                            </h3>

                            <div className="se-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {adminCustomers.map((c) => (
                                            <tr key={c._id}>
                                                <td>{c.name}</td>
                                                <td>{c.email}</td>
                                                <td>
                                                    {c.createdAt
                                                        ? new Date(
                                                            c.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    <section className="se-panel">
                        {user ? (
                            <>
                                <h2>Welcome, {user.name}!</h2>
                                <p>{user.email}</p>
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <div className="se-section-title">
                                    <div>
                                        <small className="se-eyebrow">
                                            YOUR ACCOUNT
                                        </small>

                                        <h2>
                                            {authMode === "register"
                                                ? "Create your account"
                                                : "Login to ShopEase"}
                                        </h2>
                                    </div>
                                </div>

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
                                        placeholder="Password"
                                        minLength={6}
                                        value={authData.password}
                                        onChange={handleAuthChange}
                                        required
                                    />

                                    <button>
                                        {authMode === "register"
                                            ? "Create account"
                                            : "Login"}
                                    </button>

                                    <button
                                        type="button"
                                        className="se-light"
                                        onClick={() =>
                                            setAuthMode(
                                                authMode === "login"
                                                    ? "register"
                                                    : "login"
                                            )
                                        }
                                    >
                                        {authMode === "login"
                                            ? "New here? Create account"
                                            : "Already registered? Login"}
                                    </button>
                                </form>
                            </>
                        )}
                    </section>

                    {user?.role === "admin" && (
                        <section className="se-panel">
                            <div className="se-section-title">
                                <div>
                                    <small className="se-eyebrow">
                                        STORE MANAGEMENT
                                    </small>
                                    <h2>Add New Product</h2>
                                </div>
                            </div>

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
                                    placeholder="Stock"
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleProductChange}
                                    required
                                />

                                <input
                                    type="url"
                                    name="image"
                                    placeholder="Image URL"
                                    value={formData.image}
                                    onChange={handleProductChange}
                                />

                                <button>Add Product</button>
                            </form>
                        </section>
                    )}

                    {message && <p className="se-message">{message}</p>}

                    <section id="products">
                        <div className="se-section-title">
                            <div>
                                <small className="se-eyebrow">
                                    HANDPICKED FOR YOU
                                </small>

                                <h2>Explore our collection</h2>

                                <p>
                                    Find your next favourite from our latest picks.
                                </p>
                            </div>

                            <span>{filteredProducts.length} products</span>
                        </div>

                        {loading ? (
                            <p>Loading products...</p>
                        ) : (
                            <div className="se-products">
                                {filteredProducts.map((product) => (
                                    <article
                                        className="se-card"
                                        key={product._id}
                                    >
                                        {product.image && (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                            />
                                        )}

                                        <div className="se-card-body">
                                            <h3>{product.name}</h3>

                                            <p>
                                                {product.category} · Stock:{" "}
                                                {product.stock}
                                            </p>

                                            <p className="se-price">
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString("en-IN")}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    setSelectedProduct(product)
                                                }
                                            >
                                                View Details
                                            </button>

                                            <button
                                                onClick={() => addToCart(product)}
                                                disabled={product.stock < 1}
                                            >
                                                Add to Cart
                                            </button>

                                            <button
                                                className="se-light"
                                                onClick={() =>
                                                    toggleWishlist(product)
                                                }
                                            >
                                                {wishlist.some(
                                                    (i) => i._id === product._id
                                                )
                                                    ? "♥ Saved"
                                                    : "♡ Wishlist"}
                                            </button>

                                            {user?.role === "admin" && (
                                                <>
                                                    <button
                                                        className="se-light"
                                                        onClick={() =>
                                                            startEditing(product)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="se-danger"
                                                        onClick={() =>
                                                            deleteProduct(
                                                                product._id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {user?.role === "admin" &&
                                            editingProductId === product._id && (
                                                <form
                                                    className="se-card-body"
                                                    onSubmit={saveProduct}
                                                >
                                                    <h3>Edit Product</h3>

                                                    <input
                                                        name="name"
                                                        value={editData.name}
                                                        onChange={handleEditChange}
                                                        required
                                                    />

                                                    <textarea
                                                        name="description"
                                                        placeholder="Description"
                                                        value={editData.description}
                                                        onChange={handleEditChange}
                                                    />

                                                    <input
                                                        name="price"
                                                        type="number"
                                                        value={editData.price}
                                                        onChange={handleEditChange}
                                                        required
                                                    />

                                                    <input
                                                        name="category"
                                                        value={editData.category}
                                                        onChange={handleEditChange}
                                                    />

                                                    <input
                                                        name="stock"
                                                        type="number"
                                                        value={editData.stock}
                                                        onChange={handleEditChange}
                                                        required
                                                    />

                                                    <input
                                                        name="image"
                                                        value={editData.image}
                                                        onChange={handleEditChange}
                                                    />

                                                    <button>Save Changes</button>

                                                    <button
                                                        type="button"
                                                        className="se-light"
                                                        onClick={() =>
                                                            setEditingProductId(null)
                                                        }
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
                            <p>
                                No products found. Admin account se products add
                                karein.
                            </p>
                        )}
                    </section>

                    {selectedProduct && (
                        <section className="se-details">
                            <button onClick={() => setSelectedProduct(null)}>
                                ✕ Close
                            </button>

                            {selectedProduct.image && (
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                />
                            )}

                            <h2>{selectedProduct.name}</h2>
                            <p>{selectedProduct.category}</p>
                            <h2>₹{selectedProduct.price}</h2>

                            <p>
                                {selectedProduct.description ||
                                    "No description available."}
                            </p>

                            <p>
                                Available stock: {selectedProduct.stock}
                            </p>

                            <button
                                onClick={() => addToCart(selectedProduct)}
                                disabled={selectedProduct.stock < 1}
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={() => toggleWishlist(selectedProduct)}
                            >
                                ♡ Wishlist
                            </button>

                            <div className="se-section-title">
                                <h2>Customer Reviews</h2>

                                <strong>
                                    {Number(
                                        selectedProduct.averageRating || 0
                                    ).toFixed(1)}{" "}
                                    / 5　<span className="se-stars">★</span> (
                                    {selectedProduct.numReviews || 0})
                                </strong>
                            </div>

                            <form onSubmit={submitProductReview}>
                                <label>Rating　</label>

                                <select
                                    value={reviewRating}
                                    onChange={(e) =>
                                        setReviewRating(Number(e.target.value))
                                    }
                                >
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <option value={n} key={n}>
                                            {n} stars
                                        </option>
                                    ))}
                                </select>

                                <textarea
                                    placeholder="Write your review..."
                                    value={reviewComment}
                                    onChange={(e) =>
                                        setReviewComment(e.target.value)
                                    }
                                    maxLength={1000}
                                />

                                <button disabled={submittingReview}>
                                    {submittingReview
                                        ? "Submitting..."
                                        : "Submit Review"}
                                </button>
                            </form>

                            {(selectedProduct.reviews || []).map((r, i) => (
                                <article
                                    className="se-review"
                                    key={r._id || i}
                                >
                                    <b>{r.name}</b>
                                    <span className="se-stars">
                                        {"★".repeat(r.rating)}
                                        {"☆".repeat(5 - r.rating)}
                                    </span>

                                    <p>{r.comment}</p>
                                </article>
                            ))}
                        </section>
                    )}

                    <section className="se-panel" id="wishlist">
                        <div className="se-section-title">
                            <div>
                                <small className="se-eyebrow">
                                    SAVED FOR LATER
                                </small>
                                <h2>My Wishlist ({wishlist.length})</h2>
                            </div>
                        </div>

                        {wishlist.length === 0 ? (
                            <p>Your wishlist is empty.</p>
                        ) : (
                            <div className="se-products">
                                {wishlist.map((item) => (
                                    <article
                                        className="se-card"
                                        key={item._id}
                                    >
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />
                                        )}

                                        <div className="se-card-body">
                                            <h3>{item.name}</h3>
                                            <p>₹{item.price}</p>

                                            <button
                                                onClick={() =>
                                                    addToCart(
                                                        products.find(
                                                            (p) =>
                                                                p._id === item._id
                                                        ) || item
                                                    )
                                                }
                                            >
                                                Add to Cart
                                            </button>

                                            <button
                                                className="se-light"
                                                onClick={() =>
                                                    removeFromWishlist(item._id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="se-panel" id="cart">
                        <div className="se-section-title">
                            <div>
                                <small className="se-eyebrow">
                                    READY WHEN YOU ARE
                                </small>
                                <h2>Your Shopping Cart ({cartCount})</h2>
                            </div>
                        </div>

                        {cart.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <>
                                {cart.map((item) => (
                                    <div
                                        className="se-cart-row"
                                        key={item._id}
                                    >
                                        <div>
                                            <h3>{item.name}</h3>
                                            <p>
                                                ₹{item.price} each · Subtotal ₹
                                                {item.price * item.quantity}
                                            </p>
                                        </div>

                                        <div>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, -1)
                                                }
                                            >
                                                −
                                            </button>

                                            {item.quantity}

                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, 1)
                                                }
                                                disabled={
                                                    item.quantity >= item.stock
                                                }
                                            >
                                                ＋
                                            </button>

                                            <button
                                                onClick={() =>
                                                    removeFromCart(item._id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="se-section-title">
                                    <h2>
                                        Total: ₹
                                        {cartTotal.toLocaleString("en-IN")}
                                    </h2>

                                    <button
                                        className="se-btn"
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </section>

                    {showCheckout && (
                        <section className="se-panel">
                            <div className="se-section-title">
                                <h2>Checkout</h2>

                                <button onClick={() => setShowCheckout(false)}>
                                    Close
                                </button>
                            </div>

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

                                <strong>Order total: ₹{cartTotal}</strong>

                                <button>Place Order</button>
                            </form>
                        </section>
                    )}

                    <section className="se-panel">
                        <div className="se-section-title">
                            <div>
                                <small className="se-eyebrow">
                                    YOUR PURCHASES
                                </small>
                                <h2>Order History</h2>
                            </div>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                fetchOrders(orderEmail);
                            }}
                        >
                            <input
                                type="email"
                                placeholder="Enter order email"
                                value={orderEmail}
                                onChange={(e) => setOrderEmail(e.target.value)}
                                required
                            />

                            <button>View Orders</button>
                        </form>

                        {orders.map((order) => (
                            <article
                                className="se-cart-row"
                                key={order._id}
                            >
                                <div>
                                    <h3>Order ID: {order._id}</h3>

                                    <p>
                                        Status: <b>{order.status}</b> ·{" "}
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    {order.status === "Cancelled" ? (
                                        <p>✕ Order Cancelled</p>
                                    ) : (
                                        <div className="se-tracking">
                                            {[
                                                "Placed",
                                                "Shipped",
                                                "Delivered"
                                            ].map((step, i) => (
                                                <span
                                                    key={step}
                                                    className={
                                                        i <=
                                                            [
                                                                "Placed",
                                                                "Shipped",
                                                                "Delivered"
                                                            ].indexOf(order.status)
                                                            ? "done"
                                                            : ""
                                                    }
                                                >
                                                    {i <=
                                                        [
                                                            "Placed",
                                                            "Shipped",
                                                            "Delivered"
                                                        ].indexOf(order.status)
                                                        ? "✓ "
                                                        : ""}
                                                    {step}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {order.items.map((item, i) => (
                                        <p key={i}>
                                            {item.name} × {item.quantity} — ₹
                                            {item.price * item.quantity}
                                        </p>
                                    ))}

                                    <b>Total: ₹{order.totalAmount}</b>
                                </div>
                            </article>
                        ))}
                    </section>
                </main>

                <footer className="se-footer">
                    ShopEase　·　Your everyday shopping destination　·　©{" "}
                    {new Date().getFullYear()}
                </footer>
            </div>
        </>
    );
}

export default App;