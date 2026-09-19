/* =====================================================
   PHONESTORE - ADMIN AUTH (PHP SESSION + MYSQL)
===================================================== */

const ADMIN_SESSION_KEY = 'phonestore_admin_session';

function adminAuthApiUrl(action) {
    return `../api/auth.php?action=${encodeURIComponent(action)}`;
}

async function adminApiRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json().catch(() => ({
        success: false,
        message: 'Phản hồi từ máy chủ không hợp lệ.'
    }));

    if (response.status === 401) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        if (!window.location.pathname.endsWith('/ADM/login.html')) {
            window.location.replace('login.html');
        }
    }

    if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Yêu cầu không thành công.');
    }

    return data;
}

function getAdminSession() {
    try {
        return JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY));
    } catch (_) {
        return null;
    }
}

function saveAdminSession(user) {
    if (!user) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        return;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
}

function isAdminLoggedIn() {
    const session = getAdminSession();
    return Boolean(session && session.role === 'admin');
}

async function verifyAdminSession() {
    try {
        const result = await adminApiRequest(adminAuthApiUrl('admin-me'));
        const user = result.authenticated ? result.data : null;
        if (user && user.role === 'admin') {
            saveAdminSession(user);
            return user;
        }
    } catch (_) {
        // adminApiRequest đã xử lý 401.
    }

    saveAdminSession(null);
    return null;
}

function showAdminLoginMessage(message, type) {
    const box = document.getElementById('adminLoginAlert');
    if (!box) return;
    box.textContent = message;
    box.className = `admin-login-alert show ${type}`;
}

function initAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const toggle = document.getElementById('adminPasswordToggle');

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            const result = await adminApiRequest(adminAuthApiUrl('admin-login'), {
                method: 'POST',
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    password: passwordInput.value
                })
            });
            saveAdminSession(result.data);
            showAdminLoginMessage('Đăng nhập thành công.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 350);
        } catch (error) {
            showAdminLoginMessage(error.message, 'error');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    if (toggle) {
        toggle.addEventListener('click', () => {
            const show = passwordInput.type === 'password';
            passwordInput.type = show ? 'text' : 'password';
            toggle.innerHTML = show
                ? '<i class="bi bi-eye-slash"></i>'
                : '<i class="bi bi-eye"></i>';
        });
    }
}

function updateAdminInformation() {
    const session = getAdminSession();
    if (!session) return;

    document.querySelectorAll('.admin-user').forEach(element => {
        const strong = element.querySelector('strong');
        const small = element.querySelector('small');
        if (strong) strong.textContent = session.name || session.fullName || 'Admin';
        if (small) small.textContent = 'Quản trị viên';
    });
}

function createAdminLogoutButton() {
    const menu = document.querySelector('.admin-menu');
    if (!menu || document.getElementById('adminLogoutButton')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'adminLogoutButton';
    button.className = 'admin-menu-item admin-logout-button';
    button.innerHTML = '<i class="bi bi-box-arrow-right"></i><span>Đăng xuất</span>';
    button.addEventListener('click', adminLogout);
    menu.appendChild(button);
}

async function adminLogout() {
    if (!confirm('Bạn có muốn đăng xuất Admin?')) return;

    try {
        await adminApiRequest(adminAuthApiUrl('admin-logout'), {
            method: 'POST',
            body: JSON.stringify({})
        });
    } catch (error) {
        console.warn('Admin logout:', error);
    }

    saveAdminSession(null);
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        const user = await verifyAdminSession();
        if (user) {
            window.location.href = 'index.html';
            return;
        }
        initAdminLogin();
        return;
    }

    // Hiện thông tin cache trước, sau đó xác minh lại bằng PHP session.
    updateAdminInformation();
    createAdminLogoutButton();

    const user = await verifyAdminSession();
    if (!user) {
        window.location.replace('login.html');
        return;
    }

    updateAdminInformation();
});
