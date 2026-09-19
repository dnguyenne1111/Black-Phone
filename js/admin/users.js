/* =====================================================
   PHONESTORE ADMIN - USERS (MYSQL API)
===================================================== */

let adminUsers = [];
let userDetailModal = null;

function escapeUserHTML(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getUserStatus(user) {
    return user.status === 'locked' ? 'locked' : 'active';
}

function initUserSidebar() {
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

function initUserModal() {
    const modalElement = document.getElementById('userDetailModal');
    if (modalElement) userDetailModal = new bootstrap.Modal(modalElement);
}

async function loadAdminUsers() {
    const result = await adminApiRequest('../api/users.php');
    adminUsers = Array.isArray(result.data) ? result.data : [];
}

function renderUserStatistics() {
    const total = adminUsers.length;
    const active = adminUsers.filter(user => getUserStatus(user) === 'active').length;
    const locked = adminUsers.filter(user => getUserStatus(user) === 'locked').length;

    const totalEl = document.getElementById('totalUserCount');
    const activeEl = document.getElementById('activeUserCount');
    const blockedEl = document.getElementById('blockedUserCount');
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (blockedEl) blockedEl.textContent = locked;
}

function getFilteredAdminUsers() {
    const search = (document.getElementById('userSearch')?.value || '').trim().toLowerCase();
    const status = document.getElementById('userStatusFilter')?.value || '';

    return adminUsers.filter(user => {
        const name = String(user.name || user.fullName || '').toLowerCase();
        const email = String(user.email || '').toLowerCase();
        const phone = String(user.phone || '').toLowerCase();
        const matchesSearch = name.includes(search) || email.includes(search) || phone.includes(search);
        const matchesStatus = !status || getUserStatus(user) === status;
        return matchesSearch && matchesStatus;
    });
}

function renderAdminUsers() {
    const tbody = document.getElementById('adminUserList');
    const count = document.getElementById('userAdminCount');
    const empty = document.getElementById('adminUserEmpty');
    if (!tbody) return;

    const filtered = getFilteredAdminUsers();
    if (count) count.textContent = filtered.length;

    if (!filtered.length) {
        tbody.innerHTML = '';
        empty?.classList.remove('d-none');
        return;
    }

    empty?.classList.add('d-none');
    tbody.innerHTML = filtered.map(user => {
        const status = getUserStatus(user);
        const name = escapeUserHTML(user.name || user.fullName || 'Khách hàng');
        const email = escapeUserHTML(user.email || '-');
        const phone = escapeUserHTML(user.phone || '-');
        const created = escapeUserHTML(user.createdAt || '-');
        const id = Number(user.id);

        return `
            <tr>
                <td>
                    <div class="admin-customer">
                        <div class="admin-customer-avatar"><i class="bi bi-person-fill"></i></div>
                        <div class="admin-product-name"><strong>${name}</strong><small>ID: ${id}</small></div>
                    </div>
                </td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>${created}</td>
                <td>
                    ${status === 'active'
                        ? '<span class="user-status user-active"><i class="bi bi-check-circle"></i> Hoạt động</span>'
                        : '<span class="user-status user-blocked"><i class="bi bi-lock"></i> Đã khóa</span>'}
                </td>
                <td>
                    <div class="admin-action-buttons">
                        <button type="button" class="admin-edit-btn" onclick="openUserDetail(${id})" title="Xem thông tin"><i class="bi bi-eye"></i></button>
                        <button type="button" class="${status === 'active' ? 'admin-lock-btn' : 'admin-unlock-btn'}" onclick="toggleUserStatus(${id})" title="${status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}">
                            <i class="bi bi-${status === 'active' ? 'lock' : 'unlock'}"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function openUserDetail(id) {
    const user = adminUsers.find(item => Number(item.id) === Number(id));
    if (!user) return;

    const name = user.name || user.fullName || 'Khách hàng';
    document.getElementById('userDetailTitle').textContent = name;
    document.getElementById('detailUserName').textContent = name;
    document.getElementById('detailUserEmail').textContent = user.email || '-';
    document.getElementById('detailUserPhone').textContent = user.phone || '-';
    document.getElementById('detailUserCreatedAt').textContent = user.createdAt || '-';
    document.getElementById('detailUserStatus').textContent = getUserStatus(user) === 'active' ? 'Đang hoạt động' : 'Đã khóa';
    userDetailModal?.show();
}

async function toggleUserStatus(id) {
    const user = adminUsers.find(item => Number(item.id) === Number(id));
    if (!user) return;

    const nextStatus = getUserStatus(user) === 'active' ? 'locked' : 'active';
    const question = nextStatus === 'locked'
        ? 'Bạn có chắc muốn khóa tài khoản này?'
        : 'Bạn có muốn mở khóa tài khoản này?';
    if (!confirm(question)) return;

    try {
        await adminApiRequest('../api/users.php', {
            method: 'PUT',
            body: JSON.stringify({ id: Number(id), status: nextStatus })
        });
        user.status = nextStatus;
        renderUserStatistics();
        renderAdminUsers();
    } catch (error) {
        alert(error.message);
    }
}

function initUserEvents() {
    document.getElementById('userSearch')?.addEventListener('input', renderAdminUsers);
    document.getElementById('userStatusFilter')?.addEventListener('change', renderAdminUsers);
}

document.addEventListener('DOMContentLoaded', async () => {
    initUserSidebar();
    initUserModal();
    initUserEvents();

    try {
        await loadAdminUsers();
        renderUserStatistics();
        renderAdminUsers();
    } catch (error) {
        console.error(error);
        document.getElementById('adminUserEmpty')?.classList.remove('d-none');
    }
});
