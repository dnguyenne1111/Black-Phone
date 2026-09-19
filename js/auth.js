/* =====================================================
   PHONESTORE - USER AUTH (PHP SESSION + MYSQL)
===================================================== */

const CURRENT_USER_KEY = 'phonestore_current_user';

function userApiUrl(action) {
    return `http://localhost:3000/auth/${action}`;
}

async function userApiRequest(action, options = {}) {
    const response = await fetch(userApiUrl(action), {
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

    if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Yêu cầu không thành công.');
    }

    return data;
}

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
    } catch (_) {
        return null;
    }
}

function saveCurrentUser(user) {
    if (!user) {
        sessionStorage.removeItem(CURRENT_USER_KEY);
        return;
    }
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

async function verifyCurrentUser() {
    try {
        const result = await userApiRequest('me');
        if (result.authenticated && result.data && result.data.role === 'user') {
            saveCurrentUser(result.data);
            return result.data;
        }
    } catch (error) {
        console.warn('Không thể kiểm tra phiên đăng nhập:', error);
    }

    saveCurrentUser(null);
    return null;
}

async function logout() {
    try {
        await userApiRequest('logout', {
            method: 'POST',
            body: JSON.stringify({})
        });
    } catch (error) {
        console.warn('Logout API:', error);
    }

    saveCurrentUser(null);
    window.location.href = 'index.html';
}

function showAuthMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('error', 'success');
    element.classList.add(type);
}

function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.target);
            const icon = button.querySelector('i');
            if (!input) return;

            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            if (icon) {
                icon.classList.toggle('bi-eye', !show);
                icon.classList.toggle('bi-eye-slash', show);
            }
        });
    });
}

function initRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const message = document.getElementById('registerMessage');

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim().toLowerCase();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (name.length < 2) {
            showAuthMessage(message, 'Họ tên không hợp lệ.', 'error');
            return;
        }
        if (password.length < 6) {
            showAuthMessage(message, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showAuthMessage(message, 'Mật khẩu nhập lại không khớp.', 'error');
            return;
        }

        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            await userApiRequest('register', {
                method: 'POST',
                body: JSON.stringify({ name, email, phone, password })
            });
            showAuthMessage(message, 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');
            form.reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 900);
        } catch (error) {
            showAuthMessage(message, error.message, 'error');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const message = document.getElementById('loginMessage');

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
            const result = await userApiRequest('login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const user = result.data;

            // Admin đăng nhập ở cùng form nhưng được chuyển vào trang quản trị.
            if (user && user.role === 'admin') {
                saveCurrentUser(null);
                showAuthMessage(message, 'Đăng nhập Admin thành công!', 'success');
                setTimeout(() => {
                    window.location.href = 'ADM/index.html';
                }, 500);
                return;
            }

            // Các tài khoản còn lại là khách hàng.
            saveCurrentUser(user);
            showAuthMessage(message, 'Đăng nhập thành công!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } catch (error) {
            showAuthMessage(message, error.message, 'error');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

function initForgotPassword() {
    const button = document.getElementById('forgotPassword');
    if (!button) return;

    button.addEventListener('click', async () => {
        const email = prompt('Nhập email đã đăng ký:');
        if (!email) return;

        const newPassword = prompt('Nhập mật khẩu mới (ít nhất 6 ký tự):');
        if (!newPassword) return;
        if (newPassword.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            const result = await userApiRequest('reset-password', {
                method: 'POST',
                body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword })
            });
            alert(result.message || 'Đổi mật khẩu thành công.');
        } catch (error) {
            alert(error.message);
        }
    });
}

function updateUserHeader() {
    const greeting = document.getElementById('userGreeting');
    if (!greeting) return;

    const user = getCurrentUser();
    const actionLink = greeting.closest('a.header-action');

    if (!user) {
        greeting.textContent = 'Tài khoản';
        if (actionLink) {
            actionLink.href = 'login.html';
            actionLink.onclick = null;
        }
        return;
    }

    greeting.textContent = user.name || user.fullName || 'Tài khoản';
    if (actionLink) {
        actionLink.href = '#';
        actionLink.title = 'Bấm để đăng xuất';
        actionLink.onclick = event => {
            event.preventDefault();
            if (confirm('Bạn có muốn đăng xuất?')) {
                logout();
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggle();
    initRegister();
    initLogin();
    initForgotPassword();
    updateUserHeader();

    verifyCurrentUser().then(() => {
        updateUserHeader();
    });
});
