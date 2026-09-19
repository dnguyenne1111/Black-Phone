/* =====================================================
   PHONESTORE ADMIN - ORDERS (MYSQL API)
===================================================== */

let adminOrders = [];
let orderDetailModal = null;

function orderFormatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(Number(price || 0)) + 'đ';
}

function escapeOrderHTML(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getAdminOrderImage(image) {
    if (!image) return '';
    if (/^(data:|blob:|https?:\/\/)/.test(image)) return image;
    return '../' + image.replace(/^(\.\.\/|\.\/)+/, '');
}

function getOrderStatusInfo(status) {
    const map = {
        pending: { text: 'Chờ xử lý', className: 'status-pending' },
        confirmed: { text: 'Đã xác nhận', className: 'status-processing' },
        shipping: { text: 'Đang giao', className: 'status-processing' },
        completed: { text: 'Hoàn thành', className: 'status-completed' },
        cancelled: { text: 'Đã hủy', className: 'status-cancelled' }
    };
    return map[status] || map.pending;
}

function getPaymentText(method) {
    return method === 'bank' ? 'Chuyển khoản' : 'COD';
}

function initOrderSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !toggle || !overlay) return;

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
    });
}

function initOrderModal() {
    const modalElement = document.getElementById('orderDetailModal');
    if (modalElement) orderDetailModal = new bootstrap.Modal(modalElement);
}

async function loadAdminOrders() {
    const result = await adminApiRequest('../api/orders.php');
    adminOrders = Array.isArray(result.data) ? result.data : [];
}

function renderOrderStatistics() {
    const total = adminOrders.length;
    const pending = adminOrders.filter(order => order.status === 'pending').length;
    const completed = adminOrders.filter(order => order.status === 'completed').length;
    const revenue = adminOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    document.getElementById('orderTotalCount').textContent = total;
    document.getElementById('orderPendingCount').textContent = pending;
    document.getElementById('orderCompletedCount').textContent = completed;
    document.getElementById('orderRevenue').textContent = orderFormatPrice(revenue);
}

function getFilteredAdminOrders() {
    const search = (document.getElementById('orderSearch')?.value || '').trim().toLowerCase();
    const status = document.getElementById('orderStatusFilter')?.value || '';

    return adminOrders.filter(order => {
        const customerName = String(order.customer?.fullName || '').toLowerCase();
        const phone = String(order.customer?.phone || '').toLowerCase();
        const code = String(order.orderCode || order.id || '').toLowerCase();
        const matchesSearch = code.includes(search) || customerName.includes(search) || phone.includes(search);
        const matchesStatus = !status || order.status === status;
        return matchesSearch && matchesStatus;
    });
}

function renderAdminOrders() {
    const tbody = document.getElementById('adminOrderList');
    const count = document.getElementById('orderAdminCount');
    const empty = document.getElementById('adminOrderEmpty');
    if (!tbody) return;

    const filtered = getFilteredAdminOrders();
    if (count) count.textContent = filtered.length;

    if (!filtered.length) {
        tbody.innerHTML = '';
        empty?.classList.remove('d-none');
        return;
    }

    empty?.classList.add('d-none');
    tbody.innerHTML = filtered.map(order => {
        const statusInfo = getOrderStatusInfo(order.status);
        const id = Number(order.id);
        const customerName = escapeOrderHTML(order.customer?.fullName || 'Khách hàng');
        const email = escapeOrderHTML(order.customer?.email || '');
        const phone = escapeOrderHTML(order.customer?.phone || '-');
        const code = escapeOrderHTML(order.orderCode || order.id);
        const created = escapeOrderHTML(order.createdAt || '-');

        return `
            <tr>
                <td><strong class="order-code">${code}</strong></td>
                <td><div class="admin-product-name"><strong>${customerName}</strong><small>${email}</small></div></td>
                <td>${phone}</td>
                <td>${created}</td>
                <td><strong class="admin-product-price">${orderFormatPrice(order.total)}</strong></td>
                <td><span class="admin-category-badge">${getPaymentText(order.paymentMethod)}</span></td>
                <td>
                    <select class="order-status-select ${statusInfo.className}" onchange="changeAdminOrderStatus(${id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                        <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </td>
                <td><button type="button" class="admin-edit-btn" onclick="openOrderDetail(${id})" title="Xem chi tiết"><i class="bi bi-eye"></i></button></td>
            </tr>`;
    }).join('');
}

async function changeAdminOrderStatus(id, newStatus) {
    const order = adminOrders.find(item => Number(item.id) === Number(id));
    if (!order) return;
    const oldStatus = order.status;

    try {
        await adminApiRequest('../api/orders.php', {
            method: 'PUT',
            body: JSON.stringify({ id: Number(id), status: newStatus })
        });
        order.status = newStatus;
        renderOrderStatistics();
        renderAdminOrders();
    } catch (error) {
        order.status = oldStatus;
        alert(error.message);
        renderAdminOrders();
    }
}

function openOrderDetail(id) {
    const order = adminOrders.find(item => Number(item.id) === Number(id));
    if (!order) return;

    const status = getOrderStatusInfo(order.status);
    document.getElementById('orderDetailCode').textContent = order.orderCode || order.id;
    document.getElementById('detailCustomerName').textContent = order.customer?.fullName || '-';
    document.getElementById('detailCustomerPhone').textContent = order.customer?.phone || '-';
    document.getElementById('detailCustomerEmail').textContent = order.customer?.email || '-';
    document.getElementById('detailCustomerAddress').textContent = [
        order.customer?.address,
        order.customer?.district,
        order.customer?.city
    ].filter(Boolean).join(', ') || '-';
    document.getElementById('detailCreatedAt').textContent = order.createdAt || '-';
    document.getElementById('detailPayment').textContent = getPaymentText(order.paymentMethod);
    document.getElementById('detailStatus').textContent = status.text;
    document.getElementById('detailNote').textContent = order.note || 'Không có';
    document.getElementById('detailOrderTotal').textContent = orderFormatPrice(order.total);

    const container = document.getElementById('orderDetailProducts');
    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) {
        container.innerHTML = '<p class="text-muted">Không có thông tin sản phẩm.</p>';
    } else {
        container.innerHTML = items.map(item => `
            <div class="order-detail-product">
                <div class="order-detail-product-image"><img src="${getAdminOrderImage(item.image)}" alt="${escapeOrderHTML(item.name)}"></div>
                <div class="order-detail-product-info"><strong>${escapeOrderHTML(item.name)}</strong><span>${orderFormatPrice(item.price)} × ${Number(item.quantity)}</span></div>
                <strong class="order-detail-product-total">${orderFormatPrice(Number(item.price) * Number(item.quantity))}</strong>
            </div>`).join('');
    }

    orderDetailModal?.show();
}

function initOrderEvents() {
    document.getElementById('orderSearch')?.addEventListener('input', renderAdminOrders);
    document.getElementById('orderStatusFilter')?.addEventListener('change', renderAdminOrders);
}

document.addEventListener('DOMContentLoaded', async () => {
    initOrderSidebar();
    initOrderModal();
    initOrderEvents();

    try {
        await loadAdminOrders();
        renderOrderStatistics();
        renderAdminOrders();
    } catch (error) {
        console.error(error);
        document.getElementById('adminOrderEmpty')?.classList.remove('d-none');
    }
});
