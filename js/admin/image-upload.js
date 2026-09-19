/* =====================================================
   PHONESTORE ADMIN - IMAGE UPLOAD
===================================================== */

const ADMIN_IMAGE_MAX_SIZE =
    500 * 1024;


/* ================= IMAGE SOURCE ================= */

function getAdminImageSource(image) {

    if (!image) {

        return "";

    }


    if (
        image.startsWith("data:") ||
        image.startsWith("blob:") ||
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    return "../" +
        image.replace(
            /^(\.\.\/|\.\/)+/,
            ""
        );

}


/* ================= FILE TO DATA URL ================= */

function adminFileToDataUrl(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "Không có file ảnh."
                    )
                );

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                reject(
                    new Error(
                        "File đã chọn không phải hình ảnh."
                    )
                );

                return;

            }


            if (
                file.size >
                ADMIN_IMAGE_MAX_SIZE
            ) {

                reject(
                    new Error(
                        "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 500KB."
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    resolve(
                        event.target.result
                    );

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Không thể đọc ảnh."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* ================= PREVIEW ================= */

function updateAdminImagePreview(
    previewId,
    image
) {

    const preview =
        document.getElementById(
            previewId
        );


    if (!preview) {

        return;

    }


    const img =
        preview.querySelector(
            "img"
        );


    const placeholder =
        preview.querySelector(
            ".admin-image-placeholder"
        );


    if (!image) {

        if (img) {

            img.src = "";

            img.classList.add(
                "d-none"
            );

        }


        if (placeholder) {

            placeholder.classList.remove(
                "d-none"
            );

        }


        return;

    }


    if (img) {

        img.src =
            getAdminImageSource(
                image
            );


        img.classList.remove(
            "d-none"
        );

    }


    if (placeholder) {

        placeholder.classList.add(
            "d-none"
        );

    }

}


/* ================= INITIALIZE PICKER ================= */

function initAdminImagePicker({
    fileInputId,
    valueInputId,
    previewId
}) {

    const fileInput =
        document.getElementById(
            fileInputId
        );


    const valueInput =
        document.getElementById(
            valueInputId
        );


    if (
        !fileInput ||
        !valueInput
    ) {

        return;

    }


    fileInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            try {

                const dataUrl =
                    await adminFileToDataUrl(
                        file
                    );


                valueInput.value =
                    dataUrl;


                updateAdminImagePreview(
                    previewId,
                    dataUrl
                );

            } catch (error) {

                alert(
                    error.message
                );


                fileInput.value =
                    "";

            }

        }
    );


    valueInput.addEventListener(
        "input",
        () => {

            updateAdminImagePreview(
                previewId,
                valueInput.value.trim()
            );

        }
    );

}