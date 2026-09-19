<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'me') {
    $user = current_session_user();
    json_response([
        'success' => true,
        'authenticated' => (bool)$user,
        'data' => $user
    ]);
}

if ($method === 'GET' && $action === 'admin-me') {
    $user = current_session_admin();
    json_response([
        'success' => true,
        'authenticated' => (bool)$user,
        'data' => $user
    ]);
}

if ($method !== 'POST') {
    json_response(['success' => false, 'message' => 'Method không được hỗ trợ.'], 405);
}

$input = json_input();

if ($action === 'register') {
    $name = trim((string)($input['name'] ?? ''));
    $email = normalize_email((string)($input['email'] ?? ''));
    $phone = preg_replace('/\s+/', '', trim((string)($input['phone'] ?? ''))) ?? '';
    $password = (string)($input['password'] ?? '');

    if (strlen($name) < 2) {
        json_response(['success' => false, 'message' => 'Họ tên không hợp lệ.'], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['success' => false, 'message' => 'Email không hợp lệ.'], 422);
    }
    if (!preg_match('/^(0|\+84)[0-9]{9}$/', $phone)) {
        json_response(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 422);
    }
    if (strlen($password) < 6) {
        json_response(['success' => false, 'message' => 'Mật khẩu phải có ít nhất 6 ký tự.'], 422);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1');
    $stmt->execute([$email, $phone]);
    if ($stmt->fetch()) {
        json_response(['success' => false, 'message' => 'Email hoặc số điện thoại đã được sử dụng.'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        "INSERT INTO users (full_name, email, phone, password, role, status) VALUES (?, ?, ?, ?, 'user', 'active')"
    );
    $stmt->execute([$name, $email, $phone, $hash]);

    json_response([
        'success' => true,
        'message' => 'Đăng ký thành công.',
        'id' => (int)$pdo->lastInsertId()
    ], 201);
}

if ($action === 'login') {
    $email = normalize_email((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');

    // Một form đăng nhập dùng chung cho khách hàng và Admin.
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if (!$row || !verify_password_compat($pdo, $row, $password)) {
        json_response(['success' => false, 'message' => 'Email hoặc mật khẩu không đúng.'], 401);
    }
    if (($row['status'] ?? '') === 'locked') {
        json_response(['success' => false, 'message' => 'Tài khoản của bạn đang bị khóa.'], 403);
    }

    session_regenerate_id(true);
    $user = public_user($row);

    if (($user['role'] ?? '') === 'admin') {
        unset($_SESSION['phonestore_user']);
        $_SESSION['phonestore_admin'] = $user;
    } else {
        unset($_SESSION['phonestore_admin']);
        $_SESSION['phonestore_user'] = $user;
    }

    json_response([
        'success' => true,
        'message' => 'Đăng nhập thành công.',
        'data' => $user
    ]);
}

if ($action === 'admin-login') {
    $username = trim((string)($input['username'] ?? ''));
    $password = (string)($input['password'] ?? '');

    if (strtolower($username) === 'admin') {
        $stmt = $pdo->query("SELECT * FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
        $stmt->execute([normalize_email($username)]);
    }

    $row = $stmt->fetch();
    if (!$row || !verify_password_compat($pdo, $row, $password)) {
        json_response(['success' => false, 'message' => 'Tài khoản hoặc mật khẩu Admin không đúng.'], 401);
    }
    if (($row['status'] ?? '') === 'locked') {
        json_response(['success' => false, 'message' => 'Tài khoản Admin đang bị khóa.'], 403);
    }

    session_regenerate_id(true);
    $_SESSION['phonestore_admin'] = public_user($row);

    json_response([
        'success' => true,
        'message' => 'Đăng nhập Admin thành công.',
        'data' => $_SESSION['phonestore_admin']
    ]);
}

if ($action === 'logout') {
    unset($_SESSION['phonestore_user']);
    json_response(['success' => true, 'message' => 'Đã đăng xuất.']);
}

if ($action === 'admin-logout') {
    unset($_SESSION['phonestore_admin']);
    json_response(['success' => true, 'message' => 'Đã đăng xuất Admin.']);
}

if ($action === 'reset-password') {
    // Bản demo cho đồ án. Hệ thống thực tế nên gửi token qua email thay vì đổi trực tiếp.
    $email = normalize_email((string)($input['email'] ?? ''));
    $newPassword = (string)($input['newPassword'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($newPassword) < 6) {
        json_response(['success' => false, 'message' => 'Email hoặc mật khẩu mới không hợp lệ.'], 422);
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'user' LIMIT 1");
    $stmt->execute([$email]);
    $userId = $stmt->fetchColumn();
    if (!$userId) {
        json_response(['success' => false, 'message' => 'Không tìm thấy tài khoản với email này.'], 404);
    }

    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), (int)$userId]);
    json_response(['success' => true, 'message' => 'Đổi mật khẩu thành công.']);
}

json_response(['success' => false, 'message' => 'Action không hợp lệ.'], 404);
