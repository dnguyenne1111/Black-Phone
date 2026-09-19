/* =====================================================
   PHONESTORE - CART
===================================================== */

const CART_STORAGE_KEY = "phonestore_cart";


/* ================= LẤY GIỎ HÀNG ================= */

function getCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem(CART_STORAGE_KEY)
        );

        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Lỗi đọc giỏ hàng:", error);
        return [];
    }
}


/* ================= LƯU GIỎ HÀNG ================= */

function saveCart(cart) {
    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );

    updateCartCount();
}


/* ================= SO SÁNH ID ================= */

function isSameProductId(id1, id2) {
    return String(id1) === String(id2);
}


/* ================= THÊM SẢN PHẨM ================= */

function addToCart(productId) {
    const cart = getCart();

    if (
        typeof products === "undefined" ||
        !Array.isArray(products)
    ) {
        console.error("Không tìm thấy dữ liệu sản phẩm.");
        return;
    }

    const product = products.find(
        item => isSameProductId(item.id, productId)
    );

    if (!product) {
        console.error(
            "Không tìm thấy sản phẩm:",
            productId
        );
        return;
    }


    const existingItem = cart.find(
        item => isSameProductId(item.id, productId)
    );


    if (existingItem) {
        existingItem.quantity =
            Number(existingItem.quantity || 0) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            image: product.image || "",
            quantity: 1
        });
    }


    saveCart(cart);

    refreshCartPage();

    if (typeof showToast === "function") {
        showToast(
            "Đã thêm sản phẩm vào giỏ hàng"
        );
    }

    animateCartIcon();
}


/* ================= CẬP NHẬT SỐ GIỎ ================= */

function updateCartCount() {
    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) return;


    const cart = getCart();


    const totalQuantity = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );


    cartCount.textContent = totalQuantity;
}


/* ================= HIỆU ỨNG GIỎ ================= */

function animateCartIcon() {
    const cartIcon =
        document.querySelector(".cart-icon");

    if (!cartIcon) return;


    cartIcon.classList.remove("cart-bounce");

    void cartIcon.offsetWidth;

    cartIcon.classList.add("cart-bounce");


    setTimeout(() => {
        cartIcon.classList.remove("cart-bounce");
    }, 400);
}


/* ================= RENDER LẠI GIỎ ================= */

function refreshCartPage() {
    if (typeof renderCartPage === "function") {
        renderCartPage();
    }
}


/* ================= XOÁ SẢN PHẨM ================= */

function removeFromCart(productId) {
    let cart = getCart();


    cart = cart.filter(
        item =>
            !isSameProductId(
                item.id,
                productId
            )
    );


    saveCart(cart);

    refreshCartPage();


    if (typeof showToast === "function") {
        showToast(
            "Đã xoá sản phẩm khỏi giỏ hàng"
        );
    }
}


/* ================= TĂNG SỐ LƯỢNG ================= */

function increaseQuantity(productId) {
    const cart = getCart();


    const item = cart.find(
        product =>
            isSameProductId(
                product.id,
                productId
            )
    );


    if (!item) return;


    item.quantity =
        Number(item.quantity || 0) + 1;


    saveCart(cart);

    refreshCartPage();
}


/* ================= GIẢM SỐ LƯỢNG ================= */

function decreaseQuantity(productId) {
    let cart = getCart();


    const item = cart.find(
        product =>
            isSameProductId(
                product.id,
                productId
            )
    );


    if (!item) return;


    const quantity =
        Number(item.quantity || 1);


    if (quantity > 1) {
        item.quantity = quantity - 1;
    } else {
        cart = cart.filter(
            product =>
                !isSameProductId(
                    product.id,
                    productId
                )
        );
    }


    saveCart(cart);

    refreshCartPage();
}


/* ================= XOÁ TOÀN BỘ GIỎ ================= */

function clearCart() {
    localStorage.removeItem(
        CART_STORAGE_KEY
    );

    updateCartCount();

    refreshCartPage();


    if (typeof showToast === "function") {
        showToast(
            "Đã xoá toàn bộ giỏ hàng"
        );
    }
}


/* ================= TỔNG SỐ LƯỢNG ================= */

function getCartQuantity() {
    const cart = getCart();

    return cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );
}


/* ================= TÍNH TỔNG TIỀN ================= */

function getCartTotal() {
    const cart = getCart();


    return cart.reduce(
        (total, item) => {
            const price =
                Number(item.price || 0);

            const quantity =
                Number(item.quantity || 0);

            return total + price * quantity;
        },
        0
    );
}


/* ================= KIỂM TRA GIỎ TRỐNG ================= */

function isCartEmpty() {
    return getCart().length === 0;
}


/* ================= KHỞI TẠO ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        updateCartCount();

        refreshCartPage();
    }
);