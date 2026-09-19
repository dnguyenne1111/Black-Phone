<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$changes = [];

if (!column_exists($pdo, 'products', 'is_new')) {
    $pdo->exec("ALTER TABLE products ADD COLUMN is_new TINYINT(1) NOT NULL DEFAULT 0 AFTER stock");
    $changes[] = 'Đã thêm products.is_new';

    // Giữ đúng dữ liệu demo cũ: 4 sản phẩm đầu được đánh dấu là sản phẩm mới.
    $pdo->exec("UPDATE products SET is_new = 1 ORDER BY id ASC LIMIT 4");
}

$stmt = $pdo->query("SELECT id, password FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");
$admin = $stmt->fetch();
if ($admin) {
    $info = password_get_info((string)$admin['password']);
    if (($info['algo'] ?? 0) === 0) {
        $hash = password_hash((string)$admin['password'], PASSWORD_DEFAULT);
        $update = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        $update->execute([$hash, (int)$admin['id']]);
        $changes[] = 'Đã mã hóa mật khẩu Admin cũ bằng password_hash()';
    }
}

json_response([
    'success' => true,
    'message' => 'Cấu hình database hoàn tất.',
    'changes' => $changes ?: ['Database đã ở đúng cấu trúc, không cần thay đổi thêm.']
]);
