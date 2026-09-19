/* =====================================================
   PHONESTORE - PRODUCT FILTER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const productList =
        document.getElementById("productList");

    if (!productList) return;


    const categoryFilter =
        document.getElementById("categoryFilter");

    const brandFilter =
        document.getElementById("brandFilter");

    const sortProducts =
        document.getElementById("sortProducts");

    const clearFilter =
        document.getElementById("clearFilter");

    const resetProducts =
        document.getElementById("resetProducts");

    const resultCount =
        document.getElementById("productResultCount");

    const pageTitle =
        document.getElementById("productPageTitle");

    const emptyProducts =
        document.getElementById("emptyProducts");

    const activeFilters =
        document.getElementById("activeFilters");


    /* ================= FILTER STATE ================= */

    const filterState = {
        category: "",
        brand: "",
        price: "all",
        search: "",
        sort: "default"
    };


    /* ================= CATEGORY VALUE ================= */

    function getCategoryValue(category) {

        return String(
            category.slug ||
            category.name ||
            ""
        ).toLowerCase();

    }


    /* ================= BRAND VALUE ================= */

    function getBrandValue(brand) {

        return String(
            brand.slug ||
            brand.name ||
            ""
        ).toLowerCase();

    }


    /* ================= READ URL ================= */

    function readURLParams() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        filterState.category =
            (
                params.get("category") ||
                ""
            ).toLowerCase();


        filterState.brand =
            (
                params.get("brand") ||
                ""
            ).toLowerCase();


        filterState.search =
            (
                params.get("search") ||
                ""
            ).trim();

    }


    /* ================= CATEGORY FILTER ================= */

    function renderCategoryFilter() {

        if (!categoryFilter) return;


        categoryFilter.innerHTML =
            categories.map(category => {

                const value =
                    getCategoryValue(
                        category
                    );


                const checked =
                    filterState.category ===
                    value
                        ? "checked"
                        : "";


                return `

                    <label class="filter-option">

                        <input
                            type="radio"
                            name="category"
                            value="${value}"
                            ${checked}
                        >

                        <span>
                            ${category.name}
                        </span>

                    </label>

                `;

            }).join("");

    }


    /* ================= BRAND FILTER ================= */

    function renderBrandFilter() {

        if (!brandFilter) return;


        brandFilter.innerHTML =
            brands.map(brand => {

                const value =
                    getBrandValue(
                        brand
                    );


                const checked =
                    filterState.brand ===
                    value
                        ? "checked"
                        : "";


                return `

                    <label class="filter-option">

                        <input
                            type="radio"
                            name="brand"
                            value="${value}"
                            ${checked}
                        >

                        <span>
                            ${brand.name}
                        </span>

                    </label>

                `;

            }).join("");

    }


    /* ================= PRICE ================= */

    function checkPrice(product) {

        const price =
            Number(product.price || 0);


        switch (filterState.price) {

            case "under10":

                return price <
                    10000000;


            case "10to20":

                return (
                    price >= 10000000 &&
                    price < 20000000
                );


            case "20to30":

                return (
                    price >= 20000000 &&
                    price < 30000000
                );


            case "over30":

                return price >=
                    30000000;


            default:

                return true;

        }

    }


    /* ================= FILTER PRODUCTS ================= */

    function getFilteredProducts() {

        let result =
            [...products];


        /* CATEGORY */

        if (
            filterState.category
        ) {

            result =
                result.filter(
                    product => {

                        const productCategory =
                            String(
                                product.category ||
                                ""
                            ).toLowerCase();


                        return (
                            productCategory ===
                            filterState.category
                        );

                    }
                );

        }


        /* BRAND */

        if (
            filterState.brand
        ) {

            result =
                result.filter(
                    product => {

                        const productBrand =
                            String(
                                product.brand ||
                                ""
                            ).toLowerCase();


                        const selectedBrand =
                            brands.find(
                                brand =>
                                    getBrandValue(
                                        brand
                                    ) ===
                                    filterState.brand
                            );


                        if (!selectedBrand) {

                            return (
                                productBrand ===
                                filterState.brand
                            );

                        }


                        return (
                            productBrand ===
                            String(
                                selectedBrand.name
                            ).toLowerCase()
                        );

                    }
                );

        }


        /* SEARCH */

        if (
            filterState.search
        ) {

            const keyword =
                filterState.search
                    .toLowerCase();


            result =
                result.filter(
                    product => {

                        const name =
                            String(
                                product.name ||
                                ""
                            ).toLowerCase();


                        const brand =
                            String(
                                product.brand ||
                                ""
                            ).toLowerCase();


                        const category =
                            String(
                                product.category ||
                                ""
                            ).toLowerCase();


                        return (
                            name.includes(keyword) ||
                            brand.includes(keyword) ||
                            category.includes(keyword)
                        );

                    }
                );

        }


        /* PRICE */

        result =
            result.filter(
                checkPrice
            );


        /* SORT */

        switch (
            filterState.sort
        ) {

            case "price-low":

                result.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            case "price-high":

                result.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            case "popular":

                result.sort(
                    (a, b) =>
                        Number(b.views || 0) -
                        Number(a.views || 0)
                );

                break;


            case "new":

                result.sort(
                    (a, b) =>
                        Number(b.isNew) -
                        Number(a.isNew)
                );

                break;

        }


        return result;

    }


    /* ================= RENDER PRODUCTS ================= */

function renderProducts() {
        const result = getFilteredProducts();

if (result.length === 0) {
            productList.innerHTML = "";
            if (emptyProducts) {
                emptyProducts.classList.remove("d-none");
            }
        } else {
            if (emptyProducts) {
                emptyProducts.classList.add("d-none");
            }

            // Vẽ lại HTML các thẻ sản phẩm mới
            productList.innerHTML = result.map(createProductCard).join("");
            
            if (typeof initRevealAnimation === "function") {
                initRevealAnimation();
            }
        }

        renderPageTitle();
        renderActiveFilters();
    }


    /* ================= PAGE TITLE ================= */

function renderPageTitle() {
        if (!pageTitle) return;

        if (filterState.search) {
            pageTitle.textContent = `Kết quả: "${filterState.search}"`;
            return;
        }

        if (filterState.category) {
            const category = categories.find(item => {
                const s = String(item.slug || "").toLowerCase();
                const n = String(item.name || "").toLowerCase();
                return s === filterState.category || n === filterState.category;
            });

            if (category) {
                pageTitle.textContent = category.name; 
                return;
            } else {
                pageTitle.textContent = filterState.category.replace(/-/g, " ");
                return;
            }
        }

        if (filterState.brand) {
            const brand = brands.find(item => getBrandValue(item) === filterState.brand);
            if (brand) {
                pageTitle.textContent = `Điện thoại ${brand.name}`;
                return;
            }
        }

        pageTitle.textContent = "Tất cả sản phẩm";
    }


    /* ================= ACTIVE FILTERS ================= */

    function renderActiveFilters() {

        if (!activeFilters) return;


        const filters = [];


        if (
            filterState.category
        ) {

            const category =
                categories.find(
                    item =>
                        getCategoryValue(
                            item
                        ) ===
                        filterState.category
                );


            filters.push(`

                <span class="active-filter-item">

                    Danh mục:
                    ${
                        category
                            ? category.name
                            : filterState.category
                    }

                </span>

            `);

        }


        if (
            filterState.brand
        ) {

            const brand =
                brands.find(
                    item =>
                        getBrandValue(
                            item
                        ) ===
                        filterState.brand
                );


            filters.push(`

                <span class="active-filter-item">

                    Thương hiệu:
                    ${
                        brand
                            ? brand.name
                            : filterState.brand
                    }

                </span>

            `);

        }


        if (
            filterState.search
        ) {

            filters.push(`

                <span class="active-filter-item">

                    Tìm kiếm:
                    ${filterState.search}

                </span>

            `);

        }


        if (
            filterState.price !==
            "all"
        ) {

            let priceText =
                "";


            switch (
                filterState.price
            ) {

                case "under10":

                    priceText =
                        "Dưới 10 triệu";

                    break;


                case "10to20":

                    priceText =
                        "10 - 20 triệu";

                    break;


                case "20to30":

                    priceText =
                        "20 - 30 triệu";

                    break;


                case "over30":

                    priceText =
                        "Trên 30 triệu";

                    break;

            }


            filters.push(`

                <span class="active-filter-item">

                    Giá:
                    ${priceText}

                </span>

            `);

        }


        activeFilters.innerHTML =
            filters.join("");

    }


    /* ================= CATEGORY EVENT ================= */

    if (categoryFilter) {

        categoryFilter
            .addEventListener(
                "change",
                event => {

                    if (
                        event.target.name ===
                        "category"
                    ) {

                        filterState.category =
                            event.target.value;


                        renderProducts();

                    }

                }
            );

    }


    /* ================= BRAND EVENT ================= */

    if (brandFilter) {

        brandFilter
            .addEventListener(
                "change",
                event => {

                    if (
                        event.target.name ===
                        "brand"
                    ) {

                        filterState.brand =
                            event.target.value;


                        renderProducts();

                    }

                }
            );

    }


    /* ================= PRICE EVENT ================= */

    document
        .querySelectorAll(
            'input[name="price"]'
        )
        .forEach(
            input => {

                input.addEventListener(
                    "change",
                    event => {

                        filterState.price =
                            event.target.value;


                        renderProducts();

                    }
                );

            }
        );


    /* ================= SORT EVENT ================= */

    if (sortProducts) {

        sortProducts
            .addEventListener(
                "change",
                event => {

                    filterState.sort =
                        event.target.value;


                    renderProducts();

                }
            );

    }


    /* ================= SEARCH ================= */

    const searchForm =
        document.getElementById(
            "searchForm"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (
        searchInput &&
        filterState.search
    ) {

        searchInput.value =
            filterState.search;

    }


    if (
        searchForm &&
        searchInput
    ) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                filterState.search =
                    searchInput.value
                        .trim();


                renderProducts();

            }
        );

    }


    /* ================= RESET ================= */

    function resetAllFilters() {

        filterState.category =
            "";

        filterState.brand =
            "";

        filterState.price =
            "all";

        filterState.search =
            "";

        filterState.sort =
            "default";


        if (searchInput) {

            searchInput.value =
                "";

        }


        if (sortProducts) {

            sortProducts.value =
                "default";

        }


        document
            .querySelectorAll(
                'input[name="category"]'
            )
            .forEach(
                input => {

                    input.checked =
                        false;

                }
            );


        document
            .querySelectorAll(
                'input[name="brand"]'
            )
            .forEach(
                input => {

                    input.checked =
                        false;

                }
            );


        const allPrice =
            document.querySelector(
                'input[name="price"][value="all"]'
            );


        if (allPrice) {

            allPrice.checked =
                true;

        }


        window.history
            .replaceState(
                {},
                "",
                "products.html"
            );


        renderProducts();

    }


    if (clearFilter) {

        clearFilter
            .addEventListener(
                "click",
                resetAllFilters
            );

    }


    if (resetProducts) {

        resetProducts
            .addEventListener(
                "click",
                resetAllFilters
            );

    }


    /* ================= INIT ================= */

    readURLParams();

    renderCategoryFilter();

    renderBrandFilter();

    renderProducts();

});