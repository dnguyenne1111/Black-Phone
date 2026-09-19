/* =====================================================
   PHONESTORE - PRODUCT DETAIL
===================================================== */


/* ================= SO SÁNH ID ================= */

function isSameDetailProductId(id1, id2) {
    return String(id1) === String(id2);
}


/* ================= ẢNH SẢN PHẨM ================= */

function getDetailProductImage(image) {

    if (!image) return "";

    if (
        image.startsWith("data:") ||
        image.startsWith("blob:") ||
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    return image.replace(
        /^(\.\.\/|\.\/)+/,
        ""
    );
}


/* ================= ESCAPE HTML ================= */

function escapeDetailHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ================= KHỞI TẠO ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const productDetail =
            document.getElementById(
                "productDetail"
            );

        if (!productDetail) return;


        const productNotFound =
            document.getElementById(
                "productNotFound"
            );

        const productInformation =
            document.getElementById(
                "productInformation"
            );

        const productDescription =
            document.getElementById(
                "productDescription"
            );

        const productSpecifications =
            document.getElementById(
                "productSpecifications"
            );

        const breadcrumbProduct =
            document.getElementById(
                "breadcrumbProduct"
            );

        const relatedProducts =
            document.getElementById(
                "relatedProducts"
            );


        /* ================= LẤY ID ================= */

        const params =
            new URLSearchParams(
                window.location.search
            );

        const productId =
            params.get("id");


        /* ================= KIỂM TRA DATA ================= */

        if (
            typeof products === "undefined" ||
            !Array.isArray(products)
        ) {

            console.error(
                "Không tìm thấy dữ liệu sản phẩm."
            );

            return;
        }


        /* ================= TÌM SẢN PHẨM ================= */

        const product =
            products.find(
                item =>
                    isSameDetailProductId(
                        item.id,
                        productId
                    )
            );


        /* ================= KHÔNG TÌM THẤY ================= */

        if (!product) {

            productDetail.classList.add(
                "d-none"
            );


            if (productNotFound) {

                productNotFound.classList.remove(
                    "d-none"
                );

            }


            if (productInformation) {

                productInformation.classList.add(
                    "d-none"
                );

            }


            document.title =
                "Không tìm thấy sản phẩm | BlackPhone";


            return;
        }


        /* ================= CHUẨN HÓA DATA ================= */

        const name =
            escapeDetailHtml(
                product.name
            );

        const brand =
            escapeDetailHtml(
                product.brand || "Đang cập nhật"
            );

        const ram =
            escapeDetailHtml(
                product.ram || "Đang cập nhật"
            );

        const storage =
            escapeDetailHtml(
                product.storage || "Đang cập nhật"
            );

        const image =
            getDetailProductImage(
                product.image
            );

        const price =
            Number(
                product.price || 0
            );

        const oldPrice =
            Number(
                product.oldPrice || 0
            );

        const discount =
            Number(
                product.discount || 0
            );

        const views =
            Number(
                product.views || 0
            );


        /* ================= TITLE ================= */

        document.title =
            `${product.name} | BlackPhone`;


        if (breadcrumbProduct) {

            breadcrumbProduct.textContent =
                product.name;

        }


        /* ================= RENDER DETAIL ================= */

        productDetail.innerHTML = `

            <div class="product-detail-gallery">

                <div class="product-detail-image">

                    ${
                        discount > 0
                            ? `
                                <span class="product-detail-discount">
                                    -${discount}%
                                </span>
                            `
                            : ""
                    }

                    <img
                        src="${image}"
                        alt="${name}"
                        id="mainProductImage"
                    >

                </div>

            </div>


            <div class="product-detail-content">

                <span class="product-detail-brand">
                    ${brand}
                </span>


                <h1>
                    ${name}
                </h1>


                <div class="product-detail-status">

                    <span>

                        <i class="bi bi-eye"></i>

                        ${views} lượt xem

                    </span>


                    <span class="in-stock">

                        <i class="bi bi-check-circle"></i>

                        Còn hàng

                    </span>

                </div>


                <div class="product-detail-price">

                    <strong>
                        ${formatPrice(price)}
                    </strong>


                    ${
                        oldPrice > price
                            ? `
                                <del>
                                    ${formatPrice(oldPrice)}
                                </del>
                            `
                            : ""
                    }


                    ${
                        discount > 0
                            ? `
                                <span>
                                    Tiết kiệm ${discount}%
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="product-quick-specs">

                    <div>

                        <i class="bi bi-memory"></i>

                        <span>

                            RAM

                            <strong>
                                ${ram}
                            </strong>

                        </span>

                    </div>


                    <div>

                        <i class="bi bi-device-ssd"></i>

                        <span>

                            Bộ nhớ

                            <strong>
                                ${storage}
                            </strong>

                        </span>

                    </div>


                    <div>

                        <i class="bi bi-shield-check"></i>

                        <span>

                            Bảo hành

                            <strong>
                                12 tháng
                            </strong>

                        </span>

                    </div>

                </div>


                <div class="product-promotion-box">

                    <h3>

                        <i class="bi bi-gift"></i>

                        Khuyến mãi

                    </h3>


                    <p>

                        <i class="bi bi-check-circle-fill"></i>

                        Miễn phí giao hàng toàn quốc

                    </p>


                    <p>

                        <i class="bi bi-check-circle-fill"></i>

                        Hỗ trợ đổi sản phẩm theo chính sách cửa hàng

                    </p>


                    <p>

                        <i class="bi bi-check-circle-fill"></i>

                        Sản phẩm được kiểm tra trước khi giao

                    </p>

                </div>


                <div class="product-detail-actions">

                    <button
                        type="button"
                        class="buy-now-btn"
                        id="buyNowButton"
                    >

                        <i class="bi bi-lightning-charge"></i>

                        <span>

                            MUA NGAY

                            <small>
                                Thanh toán nhanh chóng
                            </small>

                        </span>

                    </button>


                    <button
                        type="button"
                        class="detail-add-cart"
                        id="detailAddCart"
                    >

                        <i class="bi bi-cart-plus"></i>

                        <span>

                            THÊM VÀO GIỎ

                            <small>
                                Tiếp tục mua sắm
                            </small>

                        </span>

                    </button>

                </div>

            </div>
        `;


        /* ================= DESCRIPTION ================= */

        if (productDescription) {

            productDescription.innerHTML = `

                <p>

                    <strong>
                        ${name}
                    </strong>

                    là một trong những sản phẩm nổi bật
                    tại BlackPhone.

                </p>


                <p>

                    Sản phẩm phù hợp với người dùng cần
                    một chiếc smartphone hiện đại,
                    hiệu năng tốt và khả năng sử dụng
                    ổn định trong thời gian dài.

                </p>


                <p>

                    BlackPhone cung cấp sản phẩm với
                    chính sách bảo hành, hỗ trợ giao hàng
                    và tư vấn trước khi mua.

                </p>

            `;
        }


        /* ================= SPECIFICATIONS ================= */

        if (productSpecifications) {

            productSpecifications.innerHTML = `

                <div>

                    <span>
                        Thương hiệu
                    </span>

                    <strong>
                        ${brand}
                    </strong>

                </div>


                <div>

                    <span>
                        RAM
                    </span>

                    <strong>
                        ${ram}
                    </strong>

                </div>


                <div>

                    <span>
                        Bộ nhớ
                    </span>

                    <strong>
                        ${storage}
                    </strong>

                </div>


                <div>

                    <span>
                        Kết nối
                    </span>

                    <strong>
                        5G
                    </strong>

                </div>


                <div>

                    <span>
                        Bảo hành
                    </span>

                    <strong>
                        12 tháng
                    </strong>

                </div>

            `;
        }


        /* ================= ADD CART ================= */

        const detailAddCart =
            document.getElementById(
                "detailAddCart"
            );


        if (detailAddCart) {

            detailAddCart.addEventListener(
                "click",
                () => {

                    if (
                        typeof addToCart ===
                        "function"
                    ) {

                        addToCart(
                            product.id
                        );

                    }

                }
            );
        }


        /* ================= BUY NOW ================= */

        const buyNowButton =
            document.getElementById(
                "buyNowButton"
            );


        if (buyNowButton) {

            buyNowButton.addEventListener(
                "click",
                () => {

                    if (
                        typeof addToCart ===
                        "function"
                    ) {

                        addToCart(
                            product.id
                        );

                    }


                    window.location.href =
                        "cart.html";

                }
            );
        }


        /* ================= RELATED PRODUCTS ================= */

        if (
            relatedProducts &&
            typeof createProductCard ===
                "function"
        ) {

            let related =
                products.filter(
                    item =>
                        !isSameDetailProductId(
                            item.id,
                            product.id
                        ) &&
                        (
                            item.brand ===
                                product.brand ||
                            item.category ===
                                product.category
                        )
                );


            if (related.length < 4) {

                const otherProducts =
                    products.filter(
                        item =>
                            !isSameDetailProductId(
                                item.id,
                                product.id
                            ) &&
                            !related.some(
                                relatedItem =>
                                    isSameDetailProductId(
                                        relatedItem.id,
                                        item.id
                                    )
                            )
                    );


                related = [
                    ...related,
                    ...otherProducts
                ];
            }


            relatedProducts.innerHTML =
                related
                    .slice(0, 4)
                    .map(
                        createProductCard
                    )
                    .join("");
        }

    }
);