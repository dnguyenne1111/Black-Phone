/* =====================================================
   PHONESTORE ADMIN - CATEGORIES
===================================================== */

let adminCategories = [];

let categoryModal = null;
let deleteCategoryModal = null;
/* ================= IMAGE UPLOAD ================= */

function getAdminCategoryImage(image) {

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


function updateCategoryImagePreview(image) {

    const preview =
        document.querySelector("#categoryImagePreview img");

    const placeholder =
        document.querySelector(
            "#categoryImagePreview .admin-image-placeholder"
        );

    if (!preview || !placeholder) return;

    if (!image) {

        preview.src = "";

        preview.classList.add("d-none");

        placeholder.classList.remove("d-none");

        return;
    }

    preview.src =
        getAdminCategoryImage(image);

    preview.classList.remove("d-none");

    placeholder.classList.add("d-none");
}


function initCategoryImageUpload() {

    const fileInput =
        document.getElementById("categoryImageFile");

    const imageInput =
        document.getElementById("categoryImage");

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

                    updateCategoryImagePreview(
                        event.target.result
                    );
                };


            reader.readAsDataURL(file);

        }
    );


    imageInput.addEventListener(
        "input",
        function () {

            updateCategoryImagePreview(
                this.value.trim()
            );

        }
    );

}   


/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        adminCategories =
            JSON.parse(
                JSON.stringify(categories)
            );


        initCategorySidebar();

        initCategoryModals();

        initCategoryImageUpload();

        renderAdminCategories();

        initCategoryEvents();

    }
);


/* ================= SIDEBAR ================= */

function initCategorySidebar() {

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

function initCategoryModals() {

    categoryModal =
        new bootstrap.Modal(
            document.getElementById(
                "categoryModal"
            )
        );


    deleteCategoryModal =
        new bootstrap.Modal(
            document.getElementById(
                "deleteCategoryModal"
            )
        );

}


/* ================= RENDER ================= */

function renderAdminCategories() {

    const tbody =
        document.getElementById(
            "adminCategoryList"
        );

    const count =
        document.getElementById(
            "categoryAdminCount"
        );

    const empty =
        document.getElementById(
            "adminCategoryEmpty"
        );

    const search =
        document
            .getElementById(
                "categorySearch"
            )
            .value
            .trim()
            .toLowerCase();


    const filtered =
        adminCategories.filter(
            category =>
                category.name
                    .toLowerCase()
                    .includes(search) ||
                category.slug
                    .toLowerCase()
                    .includes(search)
        );


    count.textContent =
        filtered.length;


    if (
        filtered.length === 0
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
        filtered.map(category => `

            <tr>

                <td>

                    <div class="admin-product-image">

                        <img
                            src="${getAdminCategoryImage(category.image)}"
                            alt="${category.name}"
                        >

                    </div>

                </td>


                <td>

                    <div class="admin-product-name">

                        <strong>
                            ${category.name}
                        </strong>

                        <small>
                            ID: ${category.id}
                        </small>

                    </div>

                </td>


                <td>

                    <span class="admin-category-badge">

                        ${category.slug}

                    </span>

                </td>


                <td>

                    <small>
                        ${category.url}
                    </small>

                </td>


                <td>

                    <div class="admin-action-buttons">

                        <button
                            type="button"
                            class="admin-edit-btn"
                            onclick="editAdminCategory(${category.id})"
                            title="Sửa"
                        >

                            <i class="bi bi-pencil"></i>

                        </button>


                        <button
                            type="button"
                            class="admin-trash-btn"
                            onclick="requestDeleteCategory(${category.id})"
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

function initCategoryEvents() {

    document
        .getElementById(
            "addCategoryButton"
        )
        .addEventListener(
            "click",
            openAddCategoryModal
        );


    document
        .getElementById(
            "categoryForm"
        )
        .addEventListener(
            "submit",
            saveCategoryFromForm
        );


    document
        .getElementById(
            "categorySearch"
        )
        .addEventListener(
            "input",
            renderAdminCategories
        );


    document
        .getElementById(
            "confirmDeleteCategory"
        )
        .addEventListener(
            "click",
            confirmDeleteCategory
        );

}


/* ================= ADD ================= */

function openAddCategoryModal() {

    document.getElementById(
    "categoryId"
).value = "";


const categoryImageFile =
    document.getElementById("categoryImageFile");

if (categoryImageFile) {
    categoryImageFile.value = "";
}

updateCategoryImagePreview("");


categoryModal.show();

}


/* ================= EDIT ================= */

function editAdminCategory(id) {

    const category =
        adminCategories.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!category) return;


    document.getElementById(
        "categoryModalTitle"
    ).textContent =
        "Cập nhật danh mục";


    document.getElementById(
        "categoryId"
    ).value =
        category.id;


    document.getElementById(
        "categoryName"
    ).value =
        category.name || "";


    document.getElementById(
        "categorySlug"
    ).value =
        category.slug || "";


    document.getElementById(
        "categoryImage"
    ).value =
        category.image || "";
        const categoryImageFile =
    document.getElementById("categoryImageFile");

if (categoryImageFile) {
    categoryImageFile.value = "";
}

updateCategoryImagePreview(category.image);

    document.getElementById(
        "categoryUrl"
    ).value =
        category.url || "";


    categoryModal.show();

}


/* ================= SAVE ================= */

function saveCategoryFromForm(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "categoryId"
        ).value;


    const name =
        document
            .getElementById(
                "categoryName"
            )
            .value
            .trim();


    let slug =
        document
            .getElementById(
                "categorySlug"
            )
            .value
            .trim()
            .toLowerCase();


    const image =
        document
            .getElementById(
                "categoryImage"
            )
            .value
            .trim();


    let url =
        document
            .getElementById(
                "categoryUrl"
            )
            .value
            .trim();


    slug =
        createCategorySlug(
            slug
        );


    if (!url) {

        url =
            "products.html?category=" +
            slug;

    }


    const duplicated =
        adminCategories.some(
            category =>
                category.slug === slug &&
                Number(category.id) !==
                    Number(id)
        );


    if (duplicated) {

        alert(
            "Slug danh mục đã tồn tại."
        );

        return;

    }


    if (id) {

        const index =
            adminCategories.findIndex(
                category =>
                    Number(category.id) ===
                    Number(id)
            );


        if (index !== -1) {

            const oldSlug =
                adminCategories[index].slug;


            adminCategories[index] = {

                ...adminCategories[index],

                name,
                slug,
                image,
                url

            };


            updateProductsCategorySlug(
                oldSlug,
                slug
            );

        }

    } else {

        adminCategories.push({

            id: Date.now(),

            name,

            slug,

            image,

            url

        });

    }


    const saveResult = saveCategories(
        adminCategories
    );

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu danh mục vào database.");
        location.reload();
        return;
    }


    renderAdminCategories();

    categoryModal.hide();

}


/* ================= SLUG ================= */

function createCategorySlug(
    value
) {

    return value

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /đ/g,
            "d"
        )

        .replace(
            /Đ/g,
            "D"
        )

        .toLowerCase()

        .trim()

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* ================= UPDATE PRODUCTS ================= */

function updateProductsCategorySlug(
    oldSlug,
    newSlug
) {

    if (
        oldSlug === newSlug
    ) {
        return;
    }


    const updatedProducts =
        products.map(
            product => {

                if (
                    product.category ===
                    oldSlug
                ) {

                    return {

                        ...product,

                        category:
                            newSlug

                    };

                }

                return product;

            }
        );


    saveProducts(
        updatedProducts
    );

}


/* ================= DELETE ================= */

function requestDeleteCategory(
    id
) {

    const category =
        adminCategories.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!category) return;


    document.getElementById(
        "deleteCategoryId"
    ).value =
        category.id;


    document.getElementById(
        "deleteCategoryName"
    ).textContent =
        category.name;


    deleteCategoryModal.show();

}


function confirmDeleteCategory() {

    const id =
        Number(
            document.getElementById(
                "deleteCategoryId"
            ).value
        );


    const category =
        adminCategories.find(
            item =>
                Number(item.id) === id
        );


    if (!category) return;


    const hasProducts =
        products.some(
            product =>
                product.category ===
                category.slug
        );


    if (hasProducts) {

        alert(
            "Danh mục này đang có sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước."
        );

        return;

    }


    adminCategories =
        adminCategories.filter(
            item =>
                Number(item.id) !== id
        );


    const saveResult = saveCategories(
        adminCategories
    );

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu danh mục vào database.");
        location.reload();
        return;
    }


    renderAdminCategories();

    deleteCategoryModal.hide();

}