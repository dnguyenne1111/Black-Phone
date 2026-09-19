<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$stmt = $pdo->query('SELECT COUNT(*) AS total FROM users');
$result = $stmt->fetch();

json_response([
    'success' => true,
    'message' => 'Kết nối database thành công.',
    'users' => (int)$result['total']
]);
