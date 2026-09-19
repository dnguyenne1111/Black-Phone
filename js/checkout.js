/* =====================================================
   PHONESTORE - CHECKOUT (MYSQL ORDERS)
===================================================== */

function getCheckoutImage(image) {
    if (!image) return '';
    if (/^(data:|blob:|https?:\/\/)/.test(image)) return image;
    return image.replace(/^(\.\.\/|\.\/)+/, '');
}

function escapeCheckoutHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function checkoutApiRequest(payload) {
    // Trỏ đường dẫn tạo đơn hàng sang NestJS (Bạn có thể tạo thêm orders module ở NestJS sau, hoặc cấu hình tương ứng)
    const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({
        success: false,
        message: 'Phản hồi từ máy chủ không hợp lệ.'
    }));

    if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Không thể tạo đơn hàng.');
    }

    return data;
}

function prefillCheckoutUser() {
    if (typeof getCurrentUser !== 'function') return;
    const user = getCurrentUser();
    if (!user) return;

    const fullName = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');

    if (fullName && !fullName.value) fullName.value = user.name || user.fullName || '';
    if (phone && !phone.value) phone.value = user.phone || '';
    if (email && !email.value) email.value = user.email || '';
}

function renderCheckoutCart(cart) {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    if (!checkoutItems || !checkoutSubtotal || !checkoutTotal) return;

    checkoutItems.innerHTML = cart.map(item => {
        const name = escapeCheckoutHtml(item.name);
        const image = getCheckoutImage(item.image);
        const price = Number(item.price || 0);
        const quantity = Math.max(1, Number(item.quantity || 1));
        const itemTotal = price * quantity;

        return `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    <img src="${image}" alt="${name}">
                    <span>${quantity}</span>
                </div>
                <div class="checkout-item-info">
                    <strong>${name}</strong>
                    <small>${formatPrice(price)}</small>
                </div>
                <strong class="checkout-item-total">${formatPrice(itemTotal)}</strong>
            </div>`;
    }).join('');

    const total = getCartTotal();
    checkoutSubtotal.textContent = formatPrice(total);
    checkoutTotal.textContent = formatPrice(total);
}

document.addEventListener('DOMContentLoaded', () => {
    const cart = getCart();
    const checkoutForm = document.getElementById('checkoutForm');

    if (!checkoutForm) return;
    if (!cart.length) {
        alert('Giỏ hàng đang trống.');
        window.location.href = 'cart.html';
        return;
    }

    renderCheckoutCart(cart);
    prefillCheckoutUser();

    checkoutForm.addEventListener('submit', async event => {
        event.preventDefault();

        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }

        const phone = document.getElementById('phone').value.trim().replace(/\s/g, '');
        if (!/^(0|\+84)[0-9]{9}$/.test(phone)) {
            alert('Số điện thoại không hợp lệ.');
            return;
        }

        const paymentInput = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentInput) {
            alert('Vui lòng chọn phương thức thanh toán.');
            return;
        }

        const payload = {
            customer: {
                fullName: document.getElementById('fullName').value.trim(),
                phone,
                email: document.getElementById('email').value.trim(),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                district: document.getElementById('district').value.trim()
            },
            note: document.getElementById('note').value.trim(),
            paymentMethod: paymentInput.value,
            items: cart.map(item => ({
                id: Number(item.id),
                quantity: Math.max(1, Number(item.quantity || 1))
            }))
        };

        const submitButton = checkoutForm.querySelector('[type="submit"]');
        const oldText = submitButton?.innerHTML;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Đang tạo đơn...';
        }

        try {
            const result = await checkoutApiRequest(payload);
            localStorage.removeItem('phonestore_cart');
            if (typeof updateCartCount === 'function') updateCartCount();

            alert(`Đặt hàng thành công!\nMã đơn: ${result.data.orderCode}`);
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = oldText;
            }
        }
    });
});
