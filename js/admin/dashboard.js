/* =====================================================
   PHONESTORE ADMIN - DASHBOARD (MYSQL API)
===================================================== */

function dashboardFormatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(Number(price || 0)) + 'đ';
}

function dashboardEscape(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function dashboardImage(image) {
    if (!image) return '';
    if (/^(data:|blob:|https?:\/\/)/.test(image)) return image;
    return '../' + image.replace(/^(\.\.\/|\.\/)+/, '');
}

function dashboardStatusText(status) {
    const map = {
        pending: 'Chờ xử lý',
        confirmed: 'Đã xác nhận',
        shipping: 'Đang giao',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };
    return map[status] || 'Chờ xử lý';
}

function initDashboardSidebar() {
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

function renderDashboardProducts() {
    const container = document.getElementById('dashboardProducts');
    if (!container) return;

    const topProducts = [...products]
        .filter(product => product.status !== 'hidden')
        .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
        .slice(0, 4);

    if (!topProducts.length) {
        container.innerHTML = '<p class="text-muted mb-0">Chưa có sản phẩm.</p>';
        return;
    }

    container.innerHTML = topProducts.map(product => `
        <a href="products.html" class="dashboard-product-item">
            <div class="dashboard-product-image">
                <img src="${dashboardImage(product.image)}" alt="${dashboardEscape(product.name)}">
            </div>
            <div class="dashboard-product-info">
                <strong>${dashboardEscape(product.name)}</strong>
                <span>${dashboardFormatPrice(product.price)}</span>
                <small>${Number(product.views || 0)} lượt xem</small>
            </div>
        </a>
    `).join('');
}

function renderDashboardStats(users, orders) {
    const revenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const pending = orders.filter(order => order.status === 'pending').length;

    const totalProducts = document.getElementById('totalProducts');
    const totalOrders = document.getElementById('totalOrders');
    const totalUsers = document.getElementById('totalUsers');
    const totalRevenue = document.getElementById('totalRevenue');
    const sidebarOrderCount = document.getElementById('sidebarOrderCount');

    if (totalProducts) totalProducts.textContent = products.length;
    if (totalOrders) totalOrders.textContent = orders.length;
    if (totalUsers) totalUsers.textContent = users.length;
    if (totalRevenue) totalRevenue.textContent = dashboardFormatPrice(revenue);
    if (sidebarOrderCount) sidebarOrderCount.textContent = pending;
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrders');
    const empty = document.getElementById('emptyOrders');
    if (!tbody) return;

    const recent = orders.slice(0, 5);
    if (!recent.length) {
        tbody.innerHTML = '';
        empty?.classList.remove('d-none');
        return;
    }

    empty?.classList.add('d-none');
    tbody.innerHTML = recent.map(order => `
        <tr>
            <td><strong>${dashboardEscape(order.orderCode || order.id)}</strong></td>
            <td>${dashboardEscape(order.customer?.fullName || 'Khách hàng')}</td>
            <td><strong>${dashboardFormatPrice(order.total)}</strong></td>
            <td><span class="admin-category-badge">${dashboardStatusText(order.status)}</span></td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    initDashboardSidebar();
    renderDashboardProducts();

    try {
        const [usersResult, ordersResult] = await Promise.all([
            adminApiRequest('../api/users.php'),
            adminApiRequest('../api/orders.php')
        ]);

        const users = Array.isArray(usersResult.data) ? usersResult.data : [];
        const orders = Array.isArray(ordersResult.data) ? ordersResult.data : [];
        renderDashboardStats(users, orders);
        renderRecentOrders(orders);
    } catch (error) {
        console.error('Dashboard API:', error);
        renderDashboardStats([], []);
        renderRecentOrders([]);
    }
});
