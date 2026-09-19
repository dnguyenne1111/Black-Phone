document.addEventListener("DOMContentLoaded", () => {
    renderCategoryDropdown();
    renderCategories();
    renderNewProducts();
    renderBrands();
    renderPopularProducts();
    renderArticles();
    initSearch();
    initBackToTop();
    initRevealAnimation();
});


function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}


function renderCategoryDropdown() {
    const dropdown = document.getElementById("categoryDropdown");

    if (!dropdown) return;

    dropdown.innerHTML = categories.map(category => `
        <li>
            <a
                class="dropdown-item"
                href="${category.url}"
            >
                ${category.name}
            </a>
        </li>
    `).join("");
}


function renderCategories() {
    const categoryList = document.getElementById("categoryList");

    if (!categoryList) return;

    categoryList.innerHTML = categories.map(category => `
        <div class="col">
            <a
                href="${category.url}"
                class="category-card reveal"
            >
                <img
                    src="${category.image}"
                    alt="${category.name}"
                    loading="lazy"
                >

                <h3>
                    ${category.name}
                </h3>
            </a>
        </div>
    `).join("");
}


function createProductCard(product) {
    return `
        <div class="col">
            <div class="product-card reveal">

                <div class="product-image">

                    ${
                        product.discount > 0
                            ? `
                                <span class="product-discount">
                                    -${product.discount}%
                                </span>
                            `
                            : ""
                    }

                    <button
                        class="wishlist-btn"
                        type="button"
                        onclick="toggleWishlist(this)"
                        aria-label="Yêu thích sản phẩm"
                    >
                        <i class="bi bi-heart"></i>
                    </button>

                    <a href="detail.html?id=${product.id}">
                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            loading="lazy"
                        >
                    </a>

                </div>


                <div class="product-content">

                    <span class="product-brand">
                        ${product.brand}
                    </span>

                    <h3>
                        <a href="detail.html?id=${product.id}">
                            ${product.name}
                        </a>
                    </h3>


                    <div class="product-specs">

                        <span>
                            RAM ${product.ram}
                        </span>

                        <span>
                            ${product.storage}
                        </span>

                    </div>


                    <div class="product-price">

                        <strong>
                            ${formatPrice(product.price)}
                        </strong>

                        ${
                            product.oldPrice
                                ? `
                                    <del>
                                        ${formatPrice(product.oldPrice)}
                                    </del>
                                `
                                : ""
                        }

                    </div>


                    <button
                        class="add-cart-btn"
                        type="button"
                        onclick="addToCart(${product.id})"
                    >
                        <i class="bi bi-cart-plus"></i>

                        Thêm vào giỏ
                    </button>

                </div>

            </div>
        </div>
    `;
}


function renderNewProducts() {
    const newProductList = document.getElementById("newProductList");

    if (!newProductList) return;

    const newProducts = products
        .filter(product => product.isNew)
        .slice(0, 4);

    newProductList.innerHTML = newProducts
        .map(createProductCard)
        .join("");
}


function renderBrands() {
    const brandList = document.getElementById("brandList");

    if (!brandList) return;

    brandList.innerHTML = brands.map(brand => `
        <div class="col">

            <a
                href="${brand.url}"
                class="brand-card reveal"
                title="${brand.name}"
            >

                <img
                    src="${brand.image}"
                    alt="${brand.name}"
                    loading="lazy"
                >

            </a>

        </div>
    `).join("");
}


function renderPopularProducts() {
    const popularProductList =
        document.getElementById("popularProductList");

    if (!popularProductList) return;

    const popularProducts = [...products]
        .sort((a, b) => b.views - a.views)
        .slice(0, 4);

    popularProductList.innerHTML = popularProducts
        .map(createProductCard)
        .join("");
}


function renderArticles() {
    const articleList = document.getElementById("articleList");

    if (!articleList) return;

    articleList.innerHTML = articles.slice(0, 3).map(article => `
        <div class="col">

            <article class="article-card reveal">

                <div class="article-image">

                    <a href="${article.url}">

                        <img
                            src="${article.image}"
                            alt="${article.title}"
                            loading="lazy"
                        >

                    </a>

                </div>


                <div class="article-content">

                    <span class="article-date">
                        <i class="bi bi-calendar3"></i>

                        ${article.date}
                    </span>

                    <h3>
                        <a href="${article.url}">
                            ${article.title}
                        </a>
                    </h3>

                    <p>
                        ${article.description}
                    </p>

                    <a href="${article.url}">
                        Xem chi tiết

                        <i class="bi bi-arrow-right"></i>
                    </a>

                </div>

            </article>

        </div>
    `).join("");
}


function toggleWishlist(button) {
    button.classList.toggle("active");

    const icon = button.querySelector("i");

    if (button.classList.contains("active")) {
        icon.classList.remove("bi-heart");
        icon.classList.add("bi-heart-fill");

        showToast("Đã thêm vào danh sách yêu thích");
    } else {
        icon.classList.remove("bi-heart-fill");
        icon.classList.add("bi-heart");

        showToast("Đã bỏ khỏi danh sách yêu thích");
    }
}


function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


function initSearch() {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const suggestions =
        document.getElementById("searchSuggestions");

    if (!searchForm || !searchInput || !suggestions) return;


    searchInput.addEventListener("input", () => {
        const keyword = searchInput.value
            .trim()
            .toLowerCase();

        if (!keyword) {
            suggestions.innerHTML = "";
            suggestions.classList.remove("active");
            return;
        }


        const result = products
            .filter(product =>
                product.name.toLowerCase().includes(keyword) ||
                product.brand.toLowerCase().includes(keyword)
            )
            .slice(0, 5);


        if (result.length === 0) {
            suggestions.innerHTML = `
                <div class="p-3 text-muted">
                    Không tìm thấy sản phẩm
                </div>
            `;

            suggestions.classList.add("active");
            return;
        }


        suggestions.innerHTML = result.map(product => `
            <a
                href="detail.html?id=${product.id}"
                class="search-suggestion-item"
            >

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div>

                    <h4>
                        ${product.name}
                    </h4>

                    <span>
                        ${formatPrice(product.price)}
                    </span>

                </div>

            </a>
        `).join("");


        suggestions.classList.add("active");
    });


    searchForm.addEventListener("submit", event => {
        event.preventDefault();

        const keyword = searchInput.value.trim();

        if (!keyword) return;

        window.location.href =
            `products.html?search=${encodeURIComponent(keyword)}`;
    });


    document.addEventListener("click", event => {
        if (!searchForm.contains(event.target)) {
            suggestions.classList.remove("active");
        }
    });
}


function initBackToTop() {
    const backToTop = document.getElementById("backToTop");

    if (!backToTop) return;


    window.addEventListener("scroll", () => {
        if (window.scrollY > 450) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });


    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


function initRevealAnimation() {
    const revealElements =
        document.querySelectorAll(".reveal");


    if (!("IntersectionObserver" in window)) {
        revealElements.forEach(element => {
            element.classList.add("active");
        });

        return;
    }


    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");

                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );


    revealElements.forEach(element => {
        observer.observe(element);
    });
}