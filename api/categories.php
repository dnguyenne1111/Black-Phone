<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $showAll = ($_GET['all'] ?? '') === '1';
    if ($showAll) require_admin();
    $sql = $showAll ? 'SELECT * FROM categories ORDER BY id ASC' : "SELECT * FROM categories WHERE status = 'active' ORDER BY id ASC";
    $stmt = $pdo->query($sql);
    json_response(['success' => true, 'data' => $stmt->fetchAll()]);
}

if ($method === 'POST' && ($_GET['action'] ?? '') === 'sync') {
    require_admin();
    $items = json_input();
    $pdo->beginTransaction();

    try {
        $ids = [];
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $name = trim((string)($item['name'] ?? ''));
            if ($name === '') continue;
            $slug = trim((string)($item['slug'] ?? '')) ?: make_slug($name);
            $id = (int)($item['id'] ?? 0);
            $values = [$name, $slug, $item['image'] ?? null, $item['status'] ?? 'active'];

            if ($id > 0) {
                $stmt = $pdo->prepare("INSERT INTO categories (id,name,slug,image,status) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),image=VALUES(image),status=VALUES(status)");
                $stmt->execute(array_merge([$id], $values));
                $ids[] = $id;
            } else {
                $stmt = $pdo->prepare('INSERT INTO categories (name,slug,image,status) VALUES (?,?,?,?)');
                $stmt->execute($values);
                $ids[] = (int)$pdo->lastInsertId();
            }
        }

        if ($ids) {
            $marks = implode(',', array_fill(0, count($ids), '?'));
            $pdo->prepare("DELETE FROM categories WHERE id NOT IN ({$marks})")->execute($ids);
        } else {
            $pdo->exec('DELETE FROM categories');
        }

        $pdo->commit();
        json_response(['success' => true, 'message' => 'Đã đồng bộ danh mục vào MySQL.']);
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Sync categories error: ' . $e->getMessage());
        json_response(['success' => false, 'message' => 'Không thể lưu danh mục vào database.'], 500);
    }
}

json_response(['success' => false, 'message' => 'Method không được hỗ trợ.'], 405);
