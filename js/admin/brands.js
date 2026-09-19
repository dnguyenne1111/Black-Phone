/* =====================================================
   PHONESTORE ADMIN - BRANDS
===================================================== */

let adminBrands = [];

let brandModal = null;
let deleteBrandModal = null;


/* ================= IMAGE UPLOAD ================= */

function getAdminBrandImage(image) {

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


function updateBrandImagePreview(image) {

    const preview =
        document.querySelector("#brandImagePreview img");

    const placeholder =
        document.querySelector(
            "#brandImagePreview .admin-image-placeholder"
        );

    if (!preview || !placeholder) return;

    if (!image) {

        preview.src = "";

        preview.classList.add("d-none");

        placeholder.classList.remove("d-none");

        return;
    }

    preview.src =
        getAdminBrandImage(image);

    preview.classList.remove("d-none");

    placeholder.classList.add("d-none");
}


function initBrandImageUpload() {

    const fileInput =
        document.getElementById("brandImageFile");

    const imageInput =
        document.getElementById("brandImage");

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

                    updateBrandImagePreview(
                        event.target.result
                    );
                };


            reader.readAsDataURL(file);
        }
    );


    imageInput.addEventListener(
        "input",
        function () {

            updateBrandImagePreview(
                this.value.trim()
            );
        }
    );

}


/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        adminBrands =
            JSON.parse(
                JSON.stringify(brands)
            );


        initBrandSidebar();

        initBrandModals();

        initBrandImageUpload();

        renderAdminBrands();

        initBrandEvents();

    }
);


/* ================= SIDEBAR ================= */

function initBrandSidebar() {

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

function initBrandModals() {

    brandModal =
        new bootstrap.Modal(
            document.getElementById(
                "brandModal"
            )
        );


    deleteBrandModal =
        new bootstrap.Modal(
            document.getElementById(
                "deleteBrandModal"
            )
        );

}


/* ================= RENDER ================= */

function renderAdminBrands() {

    const tbody =
        document.getElementById(
            "adminBrandList"
        );

    const count =
        document.getElementById(
            "brandAdminCount"
        );

    const empty =
        document.getElementById(
            "adminBrandEmpty"
        );

    const search =
        document
            .getElementById(
                "brandSearch"
            )
            .value
            .trim()
            .toLowerCase();


    const filtered =
        adminBrands.filter(
            brand =>
                brand.name
                    .toLowerCase()
                    .includes(search) ||
                brand.slug
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
        filtered.map(brand => `

            <tr>

                <td>

                    <div class="admin-brand-image">

                        <img
                            src="${getAdminBrandImage(brand.image)}"
                            alt="${brand.name}"
                        >

                    </div>

                </td>


                <td>

                    <div class="admin-product-name">

                        <strong>
                            ${brand.name}
                        </strong>

                        <small>
                            ID: ${brand.id}
                        </small>

                    </div>

                </td>


                <td>

                    <span class="admin-category-badge">
                        ${brand.slug}
                    </span>

                </td>


                <td>

                    <small>
                        ${brand.url}
                    </small>

                </td>


                <td>

                    <div class="admin-action-buttons">

                        <button
                            type="button"
                            class="admin-edit-btn"
                            onclick="editAdminBrand(${brand.id})"
                            title="Sửa"
                        >

                            <i class="bi bi-pencil"></i>

                        </button>


                        <button
                            type="button"
                            class="admin-trash-btn"
                            onclick="requestDeleteBrand(${brand.id})"
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

function initBrandEvents() {

    document
        .getElementById(
            "addBrandButton"
        )
        .addEventListener(
            "click",
            openAddBrandModal
        );


    document
        .getElementById(
            "brandForm"
        )
        .addEventListener(
            "submit",
            saveBrandFromForm
        );


    document
        .getElementById(
            "brandSearch"
        )
        .addEventListener(
            "input",
            renderAdminBrands
        );


    document
        .getElementById(
            "confirmDeleteBrand"
        )
        .addEventListener(
            "click",
            confirmDeleteBrand
        );

}


/* ================= ADD ================= */

function openAddBrandModal() {

    document.getElementById(
        "brandModalTitle"
    ).textContent =
        "Thêm thương hiệu";


    document.getElementById(
        "brandForm"
    ).reset();


    document.getElementById(
        "brandId"
    ).value = "";


    const brandImageFile =
        document.getElementById(
            "brandImageFile"
        );

    if (brandImageFile) {
        brandImageFile.value = "";
    }


    updateBrandImagePreview("");


    brandModal.show();

}


/* ================= EDIT ================= */

function editAdminBrand(id) {

    const brand =
        adminBrands.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!brand) return;


    document.getElementById(
        "brandModalTitle"
    ).textContent =
        "Cập nhật thương hiệu";


    document.getElementById(
        "brandId"
    ).value =
        brand.id;


    document.getElementById(
        "brandName"
    ).value =
        brand.name || "";


    document.getElementById(
        "brandSlug"
    ).value =
        brand.slug || "";


    document.getElementById(
        "brandImage"
    ).value =
        brand.image || "";


    document.getElementById(
        "brandUrl"
    ).value =
        brand.url || "";


    const brandImageFile =
        document.getElementById(
            "brandImageFile"
        );

    if (brandImageFile) {
        brandImageFile.value = "";
    }


    updateBrandImagePreview(
        brand.image
    );


    brandModal.show();

}


/* ================= SAVE ================= */

function saveBrandFromForm(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "brandId"
        ).value;


    const name =
        document
            .getElementById(
                "brandName"
            )
            .value
            .trim();


    let slug =
        document
            .getElementById(
                "brandSlug"
            )
            .value
            .trim();


    const image =
        document
            .getElementById(
                "brandImage"
            )
            .value
            .trim();


    let url =
        document
            .getElementById(
                "brandUrl"
            )
            .value
            .trim();


    slug =
        createBrandSlug(
            slug
        );


    if (!url) {

        url =
            "products.html?brand=" +
            encodeURIComponent(name);

    }


    const duplicate =
        adminBrands.some(
            brand =>
                brand.slug === slug &&
                Number(brand.id) !==
                    Number(id)
        );


    if (duplicate) {

        alert(
            "Slug thương hiệu đã tồn tại."
        );

        return;

    }


    if (id) {

        const index =
            adminBrands.findIndex(
                brand =>
                    Number(brand.id) ===
                    Number(id)
            );


        if (index !== -1) {

            const oldName =
                adminBrands[index].name;


            adminBrands[index] = {

                ...adminBrands[index],

                name,

                slug,

                image,

                url

            };


            updateProductBrandName(
                oldName,
                name
            );

        }

    } else {

        adminBrands.push({

            id: Date.now(),

            name,

            slug,

            image,

            url

        });

    }


    const saveResult = saveBrands(
        adminBrands
    );

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu thương hiệu vào database.");
        location.reload();
        return;
    }


    renderAdminBrands();

    brandModal.hide();

}


/* ================= SLUG ================= */

function createBrandSlug(value) {

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


/* ================= UPDATE PRODUCT BRAND ================= */

function updateProductBrandName(
    oldName,
    newName
) {

    if (
        oldName === newName
    ) {
        return;
    }


    const updatedProducts =
        products.map(
            product => {

                if (
                    product.brand ===
                    oldName
                ) {

                    return {

                        ...product,

                        brand:
                            newName

                    };

                }


                return product;

            }
        );


    saveProducts(
        updatedProducts
    );

}


/* ================= DELETE REQUEST ================= */

function requestDeleteBrand(id) {

    const brand =
        adminBrands.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!brand) return;


    document.getElementById(
        "deleteBrandId"
    ).value =
        brand.id;


    document.getElementById(
        "deleteBrandName"
    ).textContent =
        brand.name;


    deleteBrandModal.show();

}


/* ================= DELETE ================= */

function confirmDeleteBrand() {

    const id =
        Number(
            document.getElementById(
                "deleteBrandId"
            ).value
        );


    const brand =
        adminBrands.find(
            item =>
                Number(item.id) === id
        );


    if (!brand) return;


    const hasProducts =
        products.some(
            product =>
                product.brand ===
                brand.name
        );


    if (hasProducts) {

        alert(
            "Thương hiệu này đang có sản phẩm. Hãy chuyển hoặc xóa sản phẩm trước."
        );

        return;

    }


    adminBrands =
        adminBrands.filter(
            item =>
                Number(item.id) !== id
        );


    const saveResult = saveBrands(
        adminBrands
    );

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu thương hiệu vào database.");
        location.reload();
        return;
    }


    renderAdminBrands();

    deleteBrandModal.hide();

}