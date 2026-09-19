<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $showAll = ($_GET['all'] ?? '') === '1';
    if ($showAll) require_admin();
    $sql = $showAll ? 'SELECT *, summary AS description FROM articles ORDER BY id DESC' : "SELECT *, summary AS description FROM articles WHERE status = 'published' ORDER BY id DESC";
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
            $title = trim((string)($item['title'] ?? ''));
            if ($title === '') continue;
            $slug = trim((string)($item['slug'] ?? '')) ?: make_slug($title);
            $id = (int)($item['id'] ?? 0);
            $values = [
                $title,
                $slug ?: null,
                $item['image'] ?? null,
                $item['description'] ?? $item['summary'] ?? '',
                $item['content'] ?? '',
                $item['status'] ?? 'published'
            ];

            if ($id > 0) {
                $stmt = $pdo->prepare("INSERT INTO articles (id,title,slug,image,summary,content,status) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),slug=VALUES(slug),image=VALUES(image),summary=VALUES(summary),content=VALUES(content),status=VALUES(status)");
                $stmt->execute(array_merge([$id], $values));
                $ids[] = $id;
            } else {
                $stmt = $pdo->prepare('INSERT INTO articles (title,slug,image,summary,content,status) VALUES (?,?,?,?,?,?)');
                $stmt->execute($values);
                $ids[] = (int)$pdo->lastInsertId();
            }
        }

        if ($ids) {
            $marks = implode(',', array_fill(0, count($ids), '?'));
            $pdo->prepare("DELETE FROM articles WHERE id NOT IN ({$marks})")->execute($ids);
        } else {
            $pdo->exec('DELETE FROM articles');
        }

        $pdo->commit();
        json_response(['success' => true, 'message' => 'Đã đồng bộ bài viết vào MySQL.']);
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Sync articles error: ' . $e->getMessage());
        json_response(['success' => false, 'message' => 'Không thể lưu bài viết vào database.'], 500);
    }
}

json_response(['success' => false, 'message' => 'Method không được hỗ trợ.'], 405);
