/* =====================================================
   PHONESTORE ADMIN - POSTS
===================================================== */

let adminPosts = [];

let postModal = null;
let deletePostModal = null;


/* ================= IMAGE ================= */

function getAdminPostImage(image) {

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


function updatePostImagePreview(image) {

    const preview =
        document.querySelector("#postImagePreview img");

    const placeholder =
        document.querySelector(
            "#postImagePreview .admin-image-placeholder"
        );

    if (!preview || !placeholder) return;


    if (!image) {

        preview.src = "";

        preview.classList.add("d-none");

        placeholder.classList.remove("d-none");

        return;
    }


    preview.src =
        getAdminPostImage(image);

    preview.classList.remove("d-none");

    placeholder.classList.add("d-none");
}


function initPostImageUpload() {

    const fileInput =
        document.getElementById("postImageFile");

    const imageInput =
        document.getElementById("postImage");

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

                    updatePostImagePreview(
                        event.target.result
                    );
                };


            reader.readAsDataURL(file);
        }
    );


    imageInput.addEventListener(
        "input",
        function () {

            updatePostImagePreview(
                this.value.trim()
            );
        }
    );

}


/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        adminPosts =
            JSON.parse(
                JSON.stringify(articles)
            );


        initPostSidebar();

        initPostModals();

        initPostImageUpload();

        renderAdminPosts();

        initPostEvents();

    }
);


/* ================= SIDEBAR ================= */

function initPostSidebar() {

    const sidebar =
        document.getElementById("adminSidebar");

    const toggle =
        document.getElementById("sidebarToggle");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (!sidebar || !toggle || !overlay) {
        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("show");

            overlay.classList.toggle("show");
        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove("show");

            overlay.classList.remove("show");
        }
    );

}


/* ================= MODALS ================= */

function initPostModals() {

    postModal =
        new bootstrap.Modal(
            document.getElementById("postModal")
        );


    deletePostModal =
        new bootstrap.Modal(
            document.getElementById("deletePostModal")
        );

}


/* ================= ESCAPE HTML ================= */

function escapePostHTML(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


/* ================= RENDER ================= */

function renderAdminPosts() {

    const tbody =
        document.getElementById("adminPostList");

    const count =
        document.getElementById("postAdminCount");

    const empty =
        document.getElementById("adminPostEmpty");

    const search =
        document
            .getElementById("postSearch")
            .value
            .trim()
            .toLowerCase();


    const filtered =
        adminPosts.filter(
            post => {

                const title =
                    String(
                        post.title || ""
                    ).toLowerCase();


                const description =
                    String(
                        post.description || ""
                    ).toLowerCase();


                return (
                    title.includes(search) ||
                    description.includes(search)
                );
            }
        );


    count.textContent =
        filtered.length;


    if (filtered.length === 0) {

        tbody.innerHTML = "";

        empty.classList.remove("d-none");

        return;
    }


    empty.classList.add("d-none");


    tbody.innerHTML =
        filtered.map(post => `

            <tr>

                <td>

                    <div class="admin-post-image">

                        <img
                            src="${getAdminPostImage(post.image)}"
                            alt="${escapePostHTML(post.title)}"
                        >

                    </div>

                </td>


                <td>

                    <div class="admin-post-title">

                        <strong>
                            ${escapePostHTML(post.title)}
                        </strong>

                        <small>
                            ID: ${post.id}
                        </small>

                    </div>

                </td>


                <td>

                    <div class="admin-post-description">
                        ${escapePostHTML(post.description)}
                    </div>

                </td>


                <td>

                    <span class="admin-category-badge">
                        ${escapePostHTML(post.date || "-")}
                    </span>

                </td>


                <td>

                    <div class="admin-action-buttons">

                        <button
                            type="button"
                            class="admin-edit-btn"
                            onclick="editAdminPost(${post.id})"
                            title="Sửa bài viết"
                        >

                            <i class="bi bi-pencil"></i>

                        </button>


                        <button
                            type="button"
                            class="admin-trash-btn"
                            onclick="requestDeletePost(${post.id})"
                            title="Xóa bài viết"
                        >

                            <i class="bi bi-trash3"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `).join("");

}


/* ================= EVENTS ================= */

function initPostEvents() {

    document
        .getElementById("addPostButton")
        .addEventListener(
            "click",
            openAddPostModal
        );


    document
        .getElementById("postForm")
        .addEventListener(
            "submit",
            savePostFromForm
        );


    document
        .getElementById("postSearch")
        .addEventListener(
            "input",
            renderAdminPosts
        );


    document
        .getElementById("confirmDeletePost")
        .addEventListener(
            "click",
            confirmDeletePost
        );

}


/* ================= ADD ================= */

function openAddPostModal() {

    document.getElementById(
        "postModalTitle"
    ).textContent =
        "Thêm bài viết";


    document.getElementById(
        "postForm"
    ).reset();


    document.getElementById(
        "postId"
    ).value = "";


    document.getElementById(
        "postUrl"
    ).value = "#";


    document.getElementById(
        "postDate"
    ).value =
        getCurrentDateInput();


    const postImageFile =
        document.getElementById(
            "postImageFile"
        );

    if (postImageFile) {
        postImageFile.value = "";
    }


    updatePostImagePreview("");


    postModal.show();

}


/* ================= EDIT ================= */

function editAdminPost(id) {

    const post =
        adminPosts.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!post) return;


    document.getElementById(
        "postModalTitle"
    ).textContent =
        "Cập nhật bài viết";


    document.getElementById(
        "postId"
    ).value =
        post.id;


    document.getElementById(
        "postTitle"
    ).value =
        post.title || "";


    document.getElementById(
        "postDescription"
    ).value =
        post.description || "";


    document.getElementById(
        "postImage"
    ).value =
        post.image || "";


    document.getElementById(
        "postDate"
    ).value =
        convertDisplayDateToInput(
            post.date
        );


    document.getElementById(
        "postUrl"
    ).value =
        post.url || "#";


    const postImageFile =
        document.getElementById(
            "postImageFile"
        );

    if (postImageFile) {
        postImageFile.value = "";
    }


    updatePostImagePreview(
        post.image
    );


    postModal.show();

}


/* ================= SAVE ================= */

function savePostFromForm(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "postId"
        ).value;


    const title =
        document
            .getElementById("postTitle")
            .value
            .trim();


    const description =
        document
            .getElementById("postDescription")
            .value
            .trim();


    const image =
        document
            .getElementById("postImage")
            .value
            .trim();


    const dateInput =
        document.getElementById(
            "postDate"
        ).value;


    const url =
        document
            .getElementById("postUrl")
            .value
            .trim() || "#";


    const date =
        convertInputDateToDisplay(
            dateInput
        );


    if (id) {

        const index =
            adminPosts.findIndex(
                post =>
                    Number(post.id) ===
                    Number(id)
            );


        if (index !== -1) {

            adminPosts[index] = {

                ...adminPosts[index],

                title,

                description,

                image,

                date,

                url

            };

        }

    } else {

        adminPosts.unshift({

            id: Date.now(),

            title,

            description,

            image,

            date,

            url

        });

    }


    const saveResult = saveArticles(
        adminPosts
    );

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu bài viết vào database.");
        location.reload();
        return;
    }


    renderAdminPosts();


    postModal.hide();

}


/* ================= DELETE REQUEST ================= */

function requestDeletePost(id) {

    const post =
        adminPosts.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!post) return;


    document.getElementById(
        "deletePostId"
    ).value =
        post.id;


    document.getElementById(
        "deletePostName"
    ).textContent =
        post.title;


    deletePostModal.show();

}


/* ================= DELETE ================= */

function confirmDeletePost() {

    const id =
        Number(
            document.getElementById(
                "deletePostId"
            ).value
        );


    adminPosts =
        adminPosts.filter(
            post =>
                Number(post.id) !== id
        );


    const saveResult = saveArticles(
        adminPosts
    );

    if (!saveResult || !saveResult.success) {
        alert(saveResult?.message || "Không thể lưu bài viết vào database.");
        location.reload();
        return;
    }


    renderAdminPosts();


    deletePostModal.hide();

}


/* ================= DATE ================= */

function getCurrentDateInput() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function convertInputDateToDisplay(value) {

    if (!value) return "";


    const parts =
        value.split("-");


    if (parts.length !== 3) {
        return value;
    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


function convertDisplayDateToInput(value) {

    if (!value) {

        return getCurrentDateInput();

    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        return value;

    }


    const parts =
        value.split("/");


    if (parts.length !== 3) {

        return getCurrentDateInput();

    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}