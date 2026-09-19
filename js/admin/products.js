/* =====================================================
   PHONESTORE ADMIN - PRODUCTS
===================================================== */

const PRODUCT_STORAGE_KEY = "phonestore_products";

let adminProducts = [];

let productModal = null;
let deleteProductModal = null;


/* ================= IMAGE UPLOAD ================= */

function getAdminProductImage(image) {

    if (!image) return "";

    if (
        image.startsWith("data:") ||
        image.startsWith("blob:") ||
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    return "../" + image.replace(/^(\.\.\/|\.\/)+/, "");
}


function updateProductImagePreview(image) {

    const preview =
        document.querySelector(
            "#productImagePreview img"
        );

    const placeholder =
        document.querySelector(
            "#productImagePreview .admin-image-placeholder"
        );

    if (!preview || !placeholder) return;

    if (!image) {

        preview.src = "";
        preview.classList.add("d-none");
        placeholder.classList.remove("d-none");

        return;
    }

    preview.src =
        getAdminProductImage(image);

    preview.classList.remove("d-none");
    placeholder.classList.add("d-none");
}


function initProductImageUpload() {

    const fileInput =
        document.getElementById(
            "productImageFile"
        );

    const imageInput =
        document.getElementById(
            "productImage"
        );

    if (!fileInput || !imageInput) return;


    fileInput.addEventListener(
        "change",
        function () {

            const file = this.files[0];

            if (!file) return;


            if (!file.type.startsWith("image/")) {

                alert("Vui lòng chọn file hình ảnh.");

                this.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    imageInput.value =
                        event.target.result;

                    updateProductImagePreview(
                        event.target.result
                    );
                };


            reader.readAsDataURL(file);
        }
    );


    imageInput.addEventListener(
        "input",
        function () {

            updateProductImagePreview(
                this.value.trim()
            );
        }
    );
}


/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initAdminProductSidebar();

        initProductStorage();

        initProductModals();

        initProductImageUpload();

        renderAdminProductFilters();

        renderAdminProducts();

        initAdminProductEvents();

    }
);


/* ================= STORAGE ================= */

function initProductStorage() {
    adminProducts = JSON.parse(JSON.stringify(products));
}

function saveAdminProducts() {
    products = JSON.parse(JSON.stringify(adminProducts));
    return saveProducts(products);
}


/* ================= FORMAT PRICE ================= */

function adminProductPrice(price) {

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(
        Number(price || 0)
    ) + "đ";

}


/* ================= SIDEBAR ================= */

function initAdminProductSidebar() {

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    const toggle =
        document.getElementById(
            "sidebarToggle"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !sidebar ||
        !toggle ||
        !overlay
    ) {
        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "show"
            );

            overlay.classList.toggle(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "show"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );

}


/* ================= MODALS ================= */

function initProductModals() {

    const productModalElement =
        document.getElementById(
            "productModal"
        );

    const deleteModalElement =
        document.getElementById(
            "deleteProductModal"
        );


    productModal =
        new bootstrap.Modal(
            productModalElement
        );


    deleteProductModal =
        new bootstrap.Modal(
            deleteModalElement
        );

}


/* ================= FILTER OPTIONS ================= */

function renderAdminProductFilters() {

    const brandFilter =
        document.getElementById(
            "brandFilterAdmin"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilterAdmin"
        );

    const productBrand =
        document.getElementById(
            "productBrand"
        );

    const productCategory =
        document.getElementById(
            "productCategory"
        );


    if (brandFilter) {

        brandFilter.innerHTML = `
            <option value="">
                Tất cả thương hiệu
            </option>

            ${brands.map(brand => `
                <option value="${brand.name}">
                    ${brand.name}
                </option>
            `).join("")}
        `;

    }


    if (productBrand) {

        productBrand.innerHTML =
            brands.map(brand => `
                <option value="${brand.name}">
                    ${brand.name}
                </option>
            `).join("");

    }


    if (categoryFilter) {

        categoryFilter.innerHTML = `
            <option value="">
                Tất cả danh mục
            </option>

            ${categories.map(category => `
                <option value="${category.slug || category.name.toLowerCase()}">
                    ${category.name}
                </option>
            `).join("")}
        `;

    }


    if (productCategory) {

        productCategory.innerHTML =
            categories.map(category => `
                <option value="${category.slug || category.name.toLowerCase()}">
                    ${category.name}
                </option>
            `).join("");

    }

}


/* ================= GET FILTERED ================= */

function getFilteredAdminProducts() {

    const search =
        document
            .getElementById(
                "productSearch"
            )
            .value
            .trim()
            .toLowerCase();


    const brand =
        document.getElementById(
            "brandFilterAdmin"
        ).value;


    const category =
        document.getElementById(
            "categoryFilterAdmin"
        ).value;


    return adminProducts.filter(
        product => {

            const matchSearch =
                product.name
                    .toLowerCase()
                    .includes(search);


            const matchBrand =
                !brand ||
                product.brand === brand;


            const matchCategory =
                !category ||
                product.category === category;


            return (
                matchSearch &&
                matchBrand &&
                matchCategory
            );

        }
    );

}


/* ================= RENDER ================= */

function renderAdminProducts() {

    const tbody =
        document.getElementById(
            "adminProductList"
        );

    const count =
        document.getElementById(
            "productAdminCount"
        );

    const empty =
        document.getElementById(
            "adminProductEmpty"
        );


    if (!tbody) return;


    const filteredProducts =
        getFilteredAdminProducts();


    if (count) {

        count.textContent =
            filteredProducts.length;

    }


    if (
        filteredProducts.length === 0
    ) {

        tbody.innerHTML = "";

        empty.classList.remove(
            "d-none"
        );

        return;

    }


    empty.classList.add(
        "d-none"
    );


    tbody.innerHTML =
        filteredProducts.map(product => `

            <tr>

                <td>

                    <div class="admin-product-image">

                        <img
                            src="${getAdminProductImage(product.image)}"
                            alt="${product.name}"
                        >

                    </div>

                </td>


                <td>

                    <div class="admin-product-name">

                        <strong>
                            ${product.name}
                        </strong>

                        <small>
                            ID: ${product.id}
                        </small>

                    </div>

                </td>


                <td>
                    ${product.brand}
                </td>


                <td>

                    <span class="admin-category-badge">
                        ${product.category}
                    </span>

                </td>


                <td>

                    <strong class="admin-product-price">
                        ${adminProductPrice(
                            product.price
                        )}
                    </strong>

                </td>


                <td>
                    ${product.views || 0}
                </td>


                <td>

                    <div class="admin-action-buttons">

                        <button
                            type="button"
                            class="admin-edit-btn"
                            onclick="editAdminProduct(${product.id})"
                            title="Sửa"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>


                        <button
                            type="button"
                            class="admin-trash-btn"
                            onclick="requestDeleteAdminProduct(${product.id})"
                            title="Xóa"
                        >
                            <i class="bi bi-trash3"></i>
                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


/* ================= EVENTS ================= */

function initAdminProductEvents() {

    const addButton =
        document.getElementById(
            "addProductButton"
        );

    const form =
        document.getElementById(
            "productForm"
        );

    const search =
        document.getElementById(
            "productSearch"
        );

    const brand =
        document.getElementById(
            "brandFilterAdmin"
        );

    const category =
        document.getElementById(
            "categoryFilterAdmin"
        );

    const deleteButton =
        document.getElementById(
            "confirmDeleteProduct"
        );


    addButton.addEventListener(
        "click",
        openAddProductModal
    );


    form.addEventListener(
        "submit",
        saveProductFromForm
    );


    search.addEventListener(
        "input",
        renderAdminProducts
    );


    brand.addEventListener(
        "change",
        renderAdminProducts
    );


    category.addEventListener(
        "change",
        renderAdminProducts
    );


    deleteButton.addEventListener(
        "click",
        confirmDeleteAdminProduct
    );

}


/* ================= ADD ================= */

function openAddProductModal() {

    document.getElementById(
        "productModalTitle"
    ).textContent =
        "Thêm sản phẩm";


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "productId"
    ).value = "";


    document.getElementById(
        "productViews"
    ).value = 0;


    const productImageFile =
        document.getElementById(
            "productImageFile"
        );

    if (productImageFile) {
        productImageFile.value = "";
    }

    updateProductImagePreview("");


    productModal.show();

}


/* ================= EDIT ================= */

function editAdminProduct(id) {

    const product =
        adminProducts.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) return;


    document.getElementById(
        "productModalTitle"
    ).textContent =
        "Cập nhật sản phẩm";


    document.getElementById(
        "productId"
    ).value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productBrand"
    ).value =
        product.brand || "";


    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || 0;


    document.getElementById(
        "productOldPrice"
    ).value =
        product.oldPrice || 0;


    document.getElementById(
        "productRam"
    ).value =
        product.ram || "";


    document.getElementById(
        "productStorage"
    ).value =
        product.storage || "";


    document.getElementById(
        "productViews"
    ).value =
        product.views || 0;


    document.getElementById(
        "productImage"
    ).value =
        product.image || "";


    const productImageFile =
        document.getElementById(
            "productImageFile"
        );

    if (productImageFile) {
        productImageFile.value = "";
    }

    updateProductImagePreview(
        product.image
    );


    document.getElementById(
        "productIsNew"
    ).checked =
        Boolean(product.isNew);


    productModal.show();

}


/* ================= SAVE ================= */

function saveProductFromForm(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "productId"
        ).value;


    const name =
        document.getElementById(
            "productName"
        ).value.trim();


    const brand =
        document.getElementById(
            "productBrand"
        ).value;


    const category =
        document.getElementById(
            "productCategory"
        ).value;


    const price =
        Number(
            document.getElementById(
                "productPrice"
            ).value
        );


    const oldPrice =
        Number(
            document.getElementById(
                "productOldPrice"
            ).value
        ) || price;


    const ram =
        document.getElementById(
            "productRam"
        ).value.trim();


    const storage =
        document.getElementById(
            "productStorage"
        ).value.trim();


    const views =
        Number(
            document.getElementById(
                "productViews"
            ).value
        ) || 0;


    const image =
        document.getElementById(
            "productImage"
        ).value.trim();


    const isNew =
        document.getElementById(
            "productIsNew"
        ).checked;


    let discount = 0;


    if (
        oldPrice > price &&
        oldPrice > 0
    ) {

        discount =
            Math.round(
                (
                    (
                        oldPrice -
                        price
                    ) /
                    oldPrice
                ) * 100
            );

    }


    if (id) {

        const index =
            adminProducts.findIndex(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (index !== -1) {

            adminProducts[index] = {

                ...adminProducts[index],

                name,
                brand,
                category,
                price,
                oldPrice,
                discount,
                ram,
                storage,
                views,
                image,
                isNew

            };

        }

    } else {

        const newProduct = {

            id: Date.now(),

            name,

            brand,

            category,

            price,

            oldPrice,

            discount,

            ram,

            storage,

            image,

            isNew,

            views

        };


        adminProducts.unshift(
            newProduct
        );

    }


    const saveResult = saveAdminProducts();

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu sản phẩm vào database.");
        location.reload();
        return;
    }

    renderAdminProducts();

    productModal.hide();

}


/* ================= DELETE ================= */

function requestDeleteAdminProduct(id) {

    const product =
        adminProducts.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) return;


    document.getElementById(
        "deleteProductId"
    ).value =
        product.id;


    document.getElementById(
        "deleteProductName"
    ).textContent =
        product.name;


    deleteProductModal.show();

}


function confirmDeleteAdminProduct() {

    const id =
        Number(
            document.getElementById(
                "deleteProductId"
            ).value
        );


    adminProducts =
        adminProducts.filter(
            product =>
                Number(product.id) !== id
        );


    const saveResult = saveAdminProducts();

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu sản phẩm vào database.");
        location.reload();
        return;
    }

    renderAdminProducts();

    deleteProductModal.hide();

}