<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

require_admin();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, full_name, email, phone, role, status, address, created_at, updated_at FROM users WHERE role = 'user' ORDER BY id DESC"
    );
    $rows = array_map('public_user', $stmt->fetchAll());
    json_response(['success' => true, 'data' => $rows]);
}

if ($method === 'PUT') {
    $input = json_input();
    $id = (int)($input['id'] ?? 0);
    $status = (string)($input['status'] ?? '');

    if ($id <= 0 || !in_array($status, ['active', 'locked'], true)) {
        json_response(['success' => false, 'message' => 'Dữ liệu cập nhật không hợp lệ.'], 422);
    }

    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ? AND role = 'user'");
    $stmt->execute([$status, $id]);

    if ($stmt->rowCount() === 0) {
        $check = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'user'");
        $check->execute([$id]);
        if (!$check->fetchColumn()) {
            json_response(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
    }

    json_response(['success' => true, 'message' => 'Cập nhật trạng thái tài khoản thành công.']);
}

json_response(['success' => false, 'message' => 'Method không được hỗ trợ.'], 405);
