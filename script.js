// =====================================================
// SHOP EASE - MAIN JAVASCRIPT
// =====================================================


// ================= GLOBAL VARIABLES =================

const API_URL =
    "https://fakestoreapi.com/products";


let products = [];


let cart =
    JSON.parse(
        localStorage.getItem(
            "shopEaseCart"
        )
    ) || [];


let wishlist =
    JSON.parse(
        localStorage.getItem(
            "shopEaseWishlist"
        )
    ) || [];


let visibleProducts = 8;


const productsPerLoad = 4;


// ================= DOM ELEMENTS =================

const productsContainer =
    document.getElementById(
        "products-container"
    );


const searchInput =
    document.getElementById(
        "search-input"
    );


const categoryFilter =
    document.getElementById(
        "category-filter"
    );


const sortSelect =
    document.getElementById(
        "sort-select"
    );


const loading =
    document.getElementById(
        "loading"
    );


const errorMessage =
    document.getElementById(
        "error-message"
    );


const loadMoreBtn =
    document.getElementById(
        "load-more-btn"
    );


const cartModal =
    document.getElementById(
        "cart-modal"
    );


const cartButton =
    document.getElementById(
        "cart-button"
    );


const closeCart =
    document.getElementById(
        "close-cart"
    );


const cartItems =
    document.getElementById(
        "cart-items"
    );


const cartTotal =
    document.getElementById(
        "cart-total"
    );


const cartCount =
    document.getElementById(
        "cart-count"
    );


const wishlistModal =
    document.getElementById(
        "wishlist-modal"
    );


const wishlistItems =
    document.getElementById(
        "wishlist-items"
    );


const wishlistCount =
    document.getElementById(
        "wishlist-count"
    );


// ================= PRICE HELPER =================

function getINRPrice(price) {

    return Math.round(
        price * 83
    );

}


// ================= FETCH PRODUCTS =================

async function fetchProducts() {

    if (!productsContainer) {
        return;
    }


    try {

        if (loading) {

            loading.style.display =
                "flex";

        }


        if (errorMessage) {

            errorMessage.textContent =
                "";

        }


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Failed to fetch products"
            );

        }


        products =
            await response.json();


        if (loading) {

            loading.style.display =
                "none";

        }


        visibleProducts = 8;


        filterProducts();

    }

    catch (error) {

        console.error(error);


        if (loading) {

            loading.style.display =
                "none";

        }


        if (errorMessage) {

            errorMessage.textContent =
                "Unable to load products. Please try again.";

        }

    }

}


// ================= DISPLAY PRODUCTS =================

function displayProducts(productList) {

    if (!productsContainer) {
        return;
    }


    productsContainer.innerHTML =
        "";


    if (productList.length === 0) {

        productsContainer.innerHTML = `

            <p>
                No products found.
            </p>

        `;


        if (loadMoreBtn) {

            loadMoreBtn.style.display =
                "none";

        }


        return;
    }


    const productsToShow =
        productList.slice(
            0,
            visibleProducts
        );


    productsToShow.forEach(
        product => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            const price =
                getINRPrice(
                    product.price
                );


            const isWishlisted =
                wishlist.some(
                    item =>
                        item.id ===
                        product.id
                );


            card.innerHTML = `

                <button
                    class="wishlist-btn"
                    onclick="
                        toggleWishlist(
                            ${product.id}
                        )
                    "
                >
                    ${
                        isWishlisted
                            ? "❤️"
                            : "♡"
                    }
                </button>


                <img
                    src="${product.image}"
                    alt="${product.title}"
                >


                <h3>
                    ${product.title}
                </h3>


                <p class="rating">

                    ⭐
                    ${product.rating.rate}

                    (
                    ${product.rating.count}
                    reviews
                    )

                </p>


                <p class="price">

                    ₹${price}

                </p>


                <div class="product-buttons">

                    <button
                        onclick="
                            viewProduct(
                                ${product.id}
                            )
                        "
                    >
                        View Details
                    </button>


                    <button
                        onclick="
                            addToCart(
                                ${product.id}
                            )
                        "
                    >
                        Add to Cart
                    </button>

                </div>

            `;


            productsContainer.appendChild(
                card
            );

        }
    );


    if (loadMoreBtn) {

        if (
            visibleProducts >=
            productList.length
        ) {

            loadMoreBtn.style.display =
                "none";

        }

        else {

            loadMoreBtn.style.display =
                "inline-block";

        }

    }

}


// ================= FILTER + SEARCH + SORT =================

function filterProducts() {

    if (!products.length) {
        return;
    }


    const searchTerm =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const sort =
        sortSelect
            ? sortSelect.value
            : "default";


    let filteredProducts =
        products.filter(
            product => {

                const matchesSearch =
                    product.title
                        .toLowerCase()
                        .includes(
                            searchTerm
                        );


                const matchesCategory =
                    category === "all" ||
                    product.category ===
                        category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    if (sort === "price-low") {

        filteredProducts.sort(
            (a, b) =>
                a.price - b.price
        );

    }


    else if (
        sort === "price-high"
    ) {

        filteredProducts.sort(
            (a, b) =>
                b.price - a.price
        );

    }


    else if (sort === "rating") {

        filteredProducts.sort(
            (a, b) =>
                b.rating.rate -
                a.rating.rate
        );

    }


    displayProducts(
        filteredProducts
    );

}


// ================= SEARCH EVENT =================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            visibleProducts = 8;

            filterProducts();

        }
    );

}


// ================= CATEGORY EVENT =================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function () {

            visibleProducts = 8;

            filterProducts();

        }
    );

}


// ================= SORT EVENT =================

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        function () {

            visibleProducts = 8;

            filterProducts();

        }
    );

}


// ================= LOAD MORE =================

if (loadMoreBtn) {

    loadMoreBtn.addEventListener(
        "click",
        function () {

            visibleProducts +=
                productsPerLoad;


            filterProducts();

        }
    );

}


// ================= VIEW PRODUCT =================

function viewProduct(id) {

    window.location.href =
        `product.html?id=${id}`;

}


// ================= ADD TO CART =================

function addToCart(id) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    const existingProduct =
        cart.find(
            item =>
                item.id === id
        );


    if (existingProduct) {

        existingProduct.quantity++;

    }

    else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    saveCart();

    updateCart();


    alert(
        "Product added to cart!"
    );

}


// ================= SAVE CART =================

function saveCart() {

    localStorage.setItem(
        "shopEaseCart",
        JSON.stringify(cart)
    );

}


// ================= UPDATE CART =================

function updateCart() {

    let totalQuantity = 0;


    cart.forEach(
        item => {

            totalQuantity +=
                item.quantity;

        }
    );


    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    if (!cartItems) {
        return;
    }


    cartItems.innerHTML =
        "";


    let total = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <p>
                Your cart is empty.
            </p>

        `;

    }


    cart.forEach(
        item => {

            const price =
                getINRPrice(
                    item.price
                );


            const itemTotal =
                price *
                item.quantity;


            total += itemTotal;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div
                    class="cart-item-info"
                >

                    <h4>
                        ${item.title}
                    </h4>

                    <p>
                        ₹${price}
                    </p>

                </div>


                <div
                    class="quantity-controls"
                >

                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                -1
                            )
                        "
                    >
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="
                            changeQuantity(
                                ${item.id},
                                1
                            )
                        "
                    >
                        +
                    </button>

                </div>


                <button
                    class="remove-btn"
                    onclick="
                        removeFromCart(
                            ${item.id}
                        )
                    "
                >
                    Remove
                </button>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    if (cartTotal) {

        cartTotal.textContent =
            total;

    }

}


// ================= CHANGE QUANTITY =================

function changeQuantity(
    id,
    change
) {

    const product =
        cart.find(
            item =>
                item.id === id
        );


    if (!product) {
        return;
    }


    product.quantity +=
        change;


    if (
        product.quantity <= 0
    ) {

        cart =
            cart.filter(
                item =>
                    item.id !== id
            );

    }


    saveCart();

    updateCart();

}


// ================= REMOVE FROM CART =================

function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                item.id !== id
        );


    saveCart();

    updateCart();

}


// ================= CART MODAL =================

if (cartButton) {

    cartButton.addEventListener(
        "click",
        function () {

            if (cartModal) {

                cartModal.style.display =
                    "flex";

            }


            updateCart();

        }
    );

}


if (closeCart) {

    closeCart.addEventListener(
        "click",
        function () {

            if (cartModal) {

                cartModal.style.display =
                    "none";

            }

        }
    );

}


if (cartModal) {

    cartModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                cartModal
            ) {

                cartModal.style.display =
                    "none";

            }

        }
    );

}


// ================= CHECKOUT =================

function goToCheckout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;
    }


    window.location.href =
        "checkout.html";

}


// ================= SCROLL =================

function scrollToProducts() {

    const section =
        document.getElementById(
            "products"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// ================= AUTH NAVBAR =================

function updateAuthNavbar() {

    const authLink =
        document.getElementById(
            "auth-link"
        );


    if (!authLink) {
        return;
    }


    const isLoggedIn =
        localStorage.getItem(
            "shopEaseLoggedIn"
        );


    const userName =
        localStorage.getItem(
            "shopEaseUserName"
        );


    if (
        isLoggedIn === "true"
    ) {

        authLink.innerHTML = `

            <span>
                Hi, ${
                    userName ||
                    "User"
                }
            </span>

            <button
                class="logout-btn"
                onclick="logout()"
            >
                Logout
            </button>

        `;

    }

    else {

        authLink.innerHTML = `

            <a href="login.html">
                Login
            </a>

        `;

    }

}


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem(
        "shopEaseLoggedIn"
    );


    localStorage.removeItem(
        "shopEaseUserName"
    );


    localStorage.removeItem(
        "shopEaseUser"
    );


    updateAuthNavbar();

}


// ================= PRODUCT DETAILS =================

async function displayProductDetails() {

    const container =
        document.getElementById(
            "product-details-container"
        );


    const productLoading =
        document.getElementById(
            "product-loading"
        );


    const productError =
        document.getElementById(
            "product-error"
        );


    if (!container) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    if (!productId) {

        if (productLoading) {

            productLoading.style.display =
                "none";

        }


        if (productError) {

            productError.textContent =
                "Product ID not found.";

        }


        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${productId}`
            );


        if (!response.ok) {

            throw new Error(
                "Product not found"
            );

        }


        const product =
            await response.json();


        if (productLoading) {

            productLoading.style.display =
                "none";

        }


        const price =
            getINRPrice(
                product.price
            );


        const isWishlisted =
            wishlist.some(
                item =>
                    item.id ===
                    product.id
            );


        container.innerHTML = `

            <div class="details-image">

                <img
                    src="${product.image}"
                    alt="${product.title}"
                >

            </div>


            <div class="details-info">

                <h1>
                    ${product.title}
                </h1>


                <p>

                    ⭐
                    ${product.rating.rate}

                    (
                    ${product.rating.count}
                    reviews
                    )

                </p>


                <h2
                    class="details-price"
                >
                    ₹${price}
                </h2>


                <p
                    class="details-description"
                >
                    ${product.description}
                </p>


                <p>

                    Category:

                    <strong>
                        ${product.category}
                    </strong>

                </p>


                <button
                    class="add-details-btn"
                    onclick="
                        addApiProductToCart(
                            ${product.id}
                        )
                    "
                >
                    🛒 Add to Cart
                </button>


                <button
                    class="add-details-btn"
                    onclick="
                        toggleWishlist(
                            ${product.id}
                        )
                    "
                >
                    ${
                        isWishlisted
                            ? "❤️ Remove Wishlist"
                            : "♡ Add to Wishlist"
                    }
                </button>

            </div>

        `;

    }

    catch (error) {

        console.error(error);


        if (productLoading) {

            productLoading.style.display =
                "none";

        }


        if (productError) {

            productError.textContent =
                "Unable to load product.";

        }

    }

}


// ================= ADD API PRODUCT TO CART =================

async function addApiProductToCart(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Product not found"
            );

        }


        const product =
            await response.json();


        const existingProduct =
            cart.find(
                item =>
                    item.id ===
                    product.id
            );


        if (existingProduct) {

            existingProduct.quantity++;

        }

        else {

            cart.push({

                ...product,

                quantity: 1

            });

        }


        saveCart();

        updateCart();


        alert(
            "Product added to cart!"
        );

    }

    catch (error) {

        console.error(error);


        alert(
            "Unable to add product."
        );

    }

}


// ================= WISHLIST =================

function toggleWishlist(id) {

    const existingProduct =
        wishlist.find(
            item =>
                item.id === id
        );


    if (existingProduct) {

        wishlist =
            wishlist.filter(
                item =>
                    item.id !== id
            );

    }

    else {

        let product =
            products.find(
                item =>
                    item.id === id
            );


        if (!product) {

            return;

        }


        wishlist.push(product);

    }


    saveWishlist();

    updateWishlist();


    if (productsContainer) {

        filterProducts();

    }


    if (
        document.getElementById(
            "product-details-container"
        )
    ) {

        displayProductDetails();

    }

}


// ================= SAVE WISHLIST =================

function saveWishlist() {

    localStorage.setItem(
        "shopEaseWishlist",
        JSON.stringify(wishlist)
    );

}


// ================= UPDATE WISHLIST =================

function updateWishlist() {

    if (wishlistCount) {

        wishlistCount.textContent =
            wishlist.length;

    }


    displayWishlist();

}


// ================= DISPLAY WISHLIST =================

function displayWishlist() {

    if (!wishlistItems) {
        return;
    }


    wishlistItems.innerHTML =
        "";


    if (wishlist.length === 0) {

        wishlistItems.innerHTML = `

            <p>
                Your wishlist is empty ❤️
            </p>

        `;

        return;
    }


    wishlist.forEach(
        product => {

            const price =
                getINRPrice(
                    product.price
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "wishlist-item";


            item.innerHTML = `

                <img
                    src="${product.image}"
                    alt="${product.title}"
                >


                <div
                    class="wishlist-item-info"
                >

                    <h4>
                        ${product.title}
                    </h4>

                    <p>
                        ₹${price}
                    </p>

                </div>


                <div
                    class="wishlist-actions"
                >

                    <button
                        onclick="
                            addWishlistToCart(
                                ${product.id}
                            )
                        "
                    >
                        🛒
                    </button>


                    <button
                        onclick="
                            toggleWishlist(
                                ${product.id}
                            )
                        "
                    >
                        🗑️
                    </button>

                </div>

            `;


            wishlistItems.appendChild(
                item
            );

        }
    );

}


// ================= ADD WISHLIST ITEM TO CART =================

function addWishlistToCart(id) {

    const product =
        wishlist.find(
            item =>
                item.id === id
        );


    if (!product) {
        return;
    }


    const existingProduct =
        cart.find(
            item =>
                item.id === id
        );


    if (existingProduct) {

        existingProduct.quantity++;

    }

    else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    saveCart();

    updateCart();


    alert(
        "Product added to cart!"
    );

}


// ================= SHOW WISHLIST =================

function showWishlist() {

    updateWishlist();


    if (wishlistModal) {

        wishlistModal.style.display =
            "flex";

    }

}


// ================= CLOSE WISHLIST =================

function closeWishlist() {

    if (wishlistModal) {

        wishlistModal.style.display =
            "none";

    }

}


// ================= CHECKOUT DISPLAY =================

function displayCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );


    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    if (!checkoutItems) {
        return;
    }


    checkoutItems.innerHTML =
        "";


    let total = 0;


    if (cart.length === 0) {

        checkoutItems.innerHTML = `

            <p>
                Your cart is empty.
            </p>

        `;

    }


    cart.forEach(
        item => {

            const price =
                getINRPrice(
                    item.price
                );


            const itemTotal =
                price *
                item.quantity;


            total += itemTotal;


            const div =
                document.createElement(
                    "div"
                );


            div.innerHTML = `

                <p>

                    ${item.title}

                    × ${item.quantity}

                    = ₹${itemTotal}

                </p>

            `;


            checkoutItems.appendChild(
                div
            );

        }
    );


    if (checkoutTotal) {

        checkoutTotal.textContent =
            total;

    }

}


// ================= PLACE ORDER =================

function placeOrder() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;

    }


    const name =
        document.getElementById(
            "full-name"
        )?.value.trim();


    const email =
        document.getElementById(
            "email"
        )?.value.trim();


    const phone =
        document.getElementById(
            "phone"
        )?.value.trim();


    const address =
        document.getElementById(
            "address"
        )?.value.trim();


    const city =
        document.getElementById(
            "city"
        )?.value.trim();


    const pin =
        document.getElementById(
            "pin"
        )?.value.trim();


    if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !pin
    ) {

        alert(
            "Please fill all details."
        );

        return;

    }


    const payment =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value ||
        "Cash on Delivery";


    let total = 0;


    cart.forEach(
        item => {

            total +=
                getINRPrice(
                    item.price
                ) *
                item.quantity;

        }
    );


    const order = {

        name,

        email,

        phone,

        address,

        city,

        pin,

        payment,

        total,

        items: cart,

        date:
            new Date().toLocaleString()

    };


    localStorage.setItem(
        "shopEaseOrder",
        JSON.stringify(order)
    );


    cart = [];


    saveCart();

    updateCart();


    window.location.href =
        "success.html";

}


// ================= INITIALIZATION =================

updateCart();

updateWishlist();

updateAuthNavbar();

displayCheckout();

displayProductDetails();

fetchProducts();