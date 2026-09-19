<?php

declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response([
            'success' => false,
            'message' => 'Dữ liệu JSON không hợp lệ.'
        ], 400);
    }

    return $data;
}

function current_session_user(): ?array
{
    $user = $_SESSION['phonestore_user'] ?? null;
    return is_array($user) ? $user : null;
}

function current_session_admin(): ?array
{
    $user = $_SESSION['phonestore_admin'] ?? null;
    return is_array($user) ? $user : null;
}

function require_admin(): array
{
    $user = current_session_admin();
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        json_response([
            'success' => false,
            'message' => 'Bạn cần đăng nhập Admin.'
        ], 401);
    }

    return $user;
}

function normalize_email(string $email): string
{
    return strtolower(trim($email));
}

function public_user(array $row): array
{
    return [
        'id' => (int)($row['id'] ?? 0),
        'name' => (string)($row['full_name'] ?? $row['name'] ?? ''),
        'fullName' => (string)($row['full_name'] ?? $row['name'] ?? ''),
        'email' => (string)($row['email'] ?? ''),
        'phone' => (string)($row['phone'] ?? ''),
        'role' => (string)($row['role'] ?? 'user'),
        'status' => (string)($row['status'] ?? 'active'),
        'address' => (string)($row['address'] ?? ''),
        'createdAt' => (string)($row['created_at'] ?? '')
    ];
}

function column_exists(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
    );
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function verify_password_compat(PDO $pdo, array $row, string $password): bool
{
    $stored = (string)($row['password'] ?? '');
    if ($stored === '') {
        return false;
    }

    $info = password_get_info($stored);
    if (($info['algo'] ?? 0) !== 0) {
        return password_verify($password, $stored);
    }

    // Tương thích dữ liệu demo cũ đang lưu mật khẩu thường.
    if (!hash_equals($stored, $password)) {
        return false;
    }

    $newHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$newHash, (int)$row['id']]);
    return true;
}

function make_slug(string $text): string
{
    $text = trim($text);
    if ($text === '') {
        return '';
    }

    $map = [
        'à'=>'a','á'=>'a','ạ'=>'a','ả'=>'a','ã'=>'a','â'=>'a','ầ'=>'a','ấ'=>'a','ậ'=>'a','ẩ'=>'a','ẫ'=>'a','ă'=>'a','ằ'=>'a','ắ'=>'a','ặ'=>'a','ẳ'=>'a','ẵ'=>'a',
        'è'=>'e','é'=>'e','ẹ'=>'e','ẻ'=>'e','ẽ'=>'e','ê'=>'e','ề'=>'e','ế'=>'e','ệ'=>'e','ể'=>'e','ễ'=>'e',
        'ì'=>'i','í'=>'i','ị'=>'i','ỉ'=>'i','ĩ'=>'i',
        'ò'=>'o','ó'=>'o','ọ'=>'o','ỏ'=>'o','õ'=>'o','ô'=>'o','ồ'=>'o','ố'=>'o','ộ'=>'o','ổ'=>'o','ỗ'=>'o','ơ'=>'o','ờ'=>'o','ớ'=>'o','ợ'=>'o','ở'=>'o','ỡ'=>'o',
        'ù'=>'u','ú'=>'u','ụ'=>'u','ủ'=>'u','ũ'=>'u','ư'=>'u','ừ'=>'u','ứ'=>'u','ự'=>'u','ử'=>'u','ữ'=>'u',
        'ỳ'=>'y','ý'=>'y','ỵ'=>'y','ỷ'=>'y','ỹ'=>'y','đ'=>'d'
    ];

    $lower = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
    $text = strtr($lower, $map);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-');
}
