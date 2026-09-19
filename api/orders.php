<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

function load_order_items(PDO $pdo, int $orderId): array
{
    $stmt = $pdo->prepare(
        'SELECT id, product_id, product_name AS name, product_image AS image, price, quantity, subtotal FROM order_items WHERE order_id = ? ORDER BY id ASC'
    );
    $stmt->execute([$orderId]);
    return array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'],
            'productId' => $row['product_id'] !== null ? (int)$row['product_id'] : null,
            'name' => (string)$row['name'],
            'image' => (string)($row['image'] ?? ''),
            'price' => (float)$row['price'],
            'quantity' => (int)$row['quantity'],
            'subtotal' => (float)$row['subtotal']
        ];
    }, $stmt->fetchAll());
}

function normalize_order_row(PDO $pdo, array $row): array
{
    return [
        'id' => (int)$row['id'],
        'orderCode' => (string)$row['order_code'],
        'userId' => $row['user_id'] !== null ? (int)$row['user_id'] : null,
        'customer' => [
            'fullName' => (string)$row['customer_name'],
            'phone' => (string)$row['phone'],
            'email' => (string)($row['email'] ?? ''),
            'address' => (string)$row['address'],
            'city' => (string)($row['city'] ?? ''),
            'district' => (string)($row['district'] ?? '')
        ],
        'note' => (string)($row['note'] ?? ''),
        'paymentMethod' => (string)$row['payment_method'],
        'paymentStatus' => (string)$row['payment_status'],
        'status' => (string)$row['status'],
        'total' => (float)$row['total'],
        'createdAt' => (string)$row['created_at'],
        'items' => load_order_items($pdo, (int)$row['id'])
    ];
}

if ($method === 'POST') {
    $input = json_input();
    $customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
    $items = is_array($input['items'] ?? null) ? $input['items'] : [];

    $name = trim((string)($customer['fullName'] ?? ''));
    $phone = preg_replace('/\s+/', '', trim((string)($customer['phone'] ?? ''))) ?? '';
    $email = normalize_email((string)($customer['email'] ?? ''));
    $address = trim((string)($customer['address'] ?? ''));
    $city = trim((string)($customer['city'] ?? ''));
    $district = trim((string)($customer['district'] ?? ''));
    $note = trim((string)($input['note'] ?? ''));
    $paymentMethod = (string)($input['paymentMethod'] ?? 'cod');

    if ($name === '' || $address === '' || !preg_match('/^(0|\+84)[0-9]{9}$/', $phone)) {
        json_response(['success' => false, 'message' => 'Thông tin nhận hàng chưa hợp lệ.'], 422);
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['success' => false, 'message' => 'Email không hợp lệ.'], 422);
    }
    if (!in_array($paymentMethod, ['cod', 'bank'], true)) {
        json_response(['success' => false, 'message' => 'Phương thức thanh toán không hợp lệ.'], 422);
    }
    if (!$items) {
        json_response(['success' => false, 'message' => 'Giỏ hàng đang trống.'], 422);
    }

    $productStmt = $pdo->prepare(
        "SELECT id, name, image, price, status, stock FROM products WHERE id = ? LIMIT 1"
    );

    $validatedItems = [];
    $total = 0.0;
    foreach ($items as $item) {
        $productId = (int)($item['id'] ?? $item['productId'] ?? 0);
        $quantity = min(99, max(1, (int)($item['quantity'] ?? 1)));
        if ($productId <= 0) {
            json_response(['success' => false, 'message' => 'Sản phẩm trong giỏ hàng không hợp lệ.'], 422);
        }

        $productStmt->execute([$productId]);
        $product = $productStmt->fetch();
        if (!$product || ($product['status'] ?? '') === 'hidden') {
            json_response(['success' => false, 'message' => 'Có sản phẩm không còn khả dụng. Vui lòng kiểm tra lại giỏ hàng.'], 409);
        }

        $price = (float)$product['price'];
        $subtotal = $price * $quantity;
        $total += $subtotal;
        $validatedItems[] = [
            'product_id' => (int)$product['id'],
            'name' => (string)$product['name'],
            'image' => (string)($product['image'] ?? ''),
            'price' => $price,
            'quantity' => $quantity,
            'subtotal' => $subtotal
        ];
    }

    $sessionUser = current_session_user();
    $userId = ($sessionUser && ($sessionUser['role'] ?? '') === 'user') ? (int)$sessionUser['id'] : null;

    $orderCode = 'PS' . date('ymdHis') . random_int(1000, 9999);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            "INSERT INTO orders (order_code, user_id, customer_name, phone, email, address, city, district, note, payment_method, payment_status, status, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending', ?)"
        );
        $stmt->execute([
            $orderCode, $userId, $name, $phone, $email !== '' ? $email : null,
            $address, $city !== '' ? $city : null, $district !== '' ? $district : null,
            $note !== '' ? $note : null, $paymentMethod, $total
        ]);
        $orderId = (int)$pdo->lastInsertId();

        $itemStmt = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        foreach ($validatedItems as $item) {
            $itemStmt->execute([
                $orderId, $item['product_id'], $item['name'], $item['image'],
                $item['price'], $item['quantity'], $item['subtotal']
            ]);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Create order error: ' . $e->getMessage());
        json_response(['success' => false, 'message' => 'Không thể tạo đơn hàng. Vui lòng thử lại.'], 500);
    }

    json_response([
        'success' => true,
        'message' => 'Đặt hàng thành công.',
        'data' => [
            'id' => $orderId,
            'orderCode' => $orderCode,
            'total' => $total
        ]
    ], 201);
}

if ($method === 'GET') {
    require_admin();
    $stmt = $pdo->query('SELECT * FROM orders ORDER BY id DESC');
    $orders = [];
    foreach ($stmt->fetchAll() as $row) {
        $orders[] = normalize_order_row($pdo, $row);
    }
    json_response(['success' => true, 'data' => $orders]);
}

if ($method === 'PUT') {
    require_admin();
    $input = json_input();
    $id = (int)($input['id'] ?? 0);
    $status = (string)($input['status'] ?? '');
    $allowed = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

    if ($id <= 0 || !in_array($status, $allowed, true)) {
        json_response(['success' => false, 'message' => 'Trạng thái đơn hàng không hợp lệ.'], 422);
    }

    $paymentStatus = $status === 'completed' ? 'paid' : null;
    if ($paymentStatus) {
        $stmt = $pdo->prepare('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?');
        $stmt->execute([$status, $paymentStatus, $id]);
    } else {
        $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
    }

    json_response(['success' => true, 'message' => 'Cập nhật trạng thái đơn hàng thành công.']);
}

json_response(['success' => false, 'message' => 'Method không được hỗ trợ.'], 405);
