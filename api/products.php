<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$hasIsNew = column_exists($pdo, 'products', 'is_new');

function product_select_sql(bool $hasIsNew): string
{
    $isNew = $hasIsNew ? 'p.is_new AS isNew' : '0 AS isNew';
    return "SELECT p.*, p.old_price AS oldPrice, {$isNew}, c.slug AS category, c.name AS category_name, b.name AS brand, b.slug AS brand_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id";
}

if ($method === 'GET') {
    $showAll = ($_GET['all'] ?? '') === '1';
    if ($showAll) {
        require_admin();
    }

    if (isset($_GET['id'])) {
        $where = $showAll ? ' WHERE p.id = ?' : " WHERE p.id = ? AND p.status <> 'hidden'";
        $stmt = $pdo->prepare(product_select_sql($hasIsNew) . $where . ' LIMIT 1');
        $stmt->execute([(int)$_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) {
            json_response(['success' => false, 'message' => 'Không tìm thấy sản phẩm.'], 404);
        }
        json_response(['success' => true, 'data' => $row]);
    }

    $where = $showAll ? '' : " WHERE p.status <> 'hidden'";
    $stmt = $pdo->query(product_select_sql($hasIsNew) . $where . ' ORDER BY p.id DESC');
    json_response(['success' => true, 'data' => $stmt->fetchAll()]);
}

if ($method === 'POST' && ($_GET['action'] ?? '') === 'sync') {
    require_admin();
    $items = json_input();
    $pdo->beginTransaction();

    try {
        $ids = [];
        $categoryStmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
        $brandStmt = $pdo->prepare('SELECT id FROM brands WHERE name = ? LIMIT 1');

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $name = trim((string)($item['name'] ?? ''));
            if ($name === '') {
                continue;
            }

            $categoryStmt->execute([(string)($item['category'] ?? '')]);
            $categoryId = $categoryStmt->fetchColumn() ?: null;
            $brandStmt->execute([(string)($item['brand'] ?? '')]);
            $brandId = $brandStmt->fetchColumn() ?: null;

            $id = (int)($item['id'] ?? 0);
            $slug = trim((string)($item['slug'] ?? '')) ?: make_slug($name);
            $base = [
                $name,
                $slug ?: null,
                $categoryId,
                $brandId,
                (float)($item['price'] ?? 0),
                (float)($item['oldPrice'] ?? $item['old_price'] ?? 0),
                (int)($item['discount'] ?? 0),
                $item['image'] ?? null,
                $item['ram'] ?? null,
                $item['storage'] ?? null,
                $item['description'] ?? null,
                (int)($item['stock'] ?? 0),
                (int)($item['views'] ?? 0),
                $item['status'] ?? 'active'
            ];

            if ($hasIsNew) {
                $base[] = !empty($item['isNew']) || !empty($item['is_new']) ? 1 : 0;
            }

            if ($id > 0) {
                if ($hasIsNew) {
                    $sql = "INSERT INTO products (id,name,slug,category_id,brand_id,price,old_price,discount,image,ram,storage,description,stock,views,status,is_new) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),category_id=VALUES(category_id),brand_id=VALUES(brand_id),price=VALUES(price),old_price=VALUES(old_price),discount=VALUES(discount),image=VALUES(image),ram=VALUES(ram),storage=VALUES(storage),description=VALUES(description),stock=VALUES(stock),views=VALUES(views),status=VALUES(status),is_new=VALUES(is_new)";
                } else {
                    $sql = "INSERT INTO products (id,name,slug,category_id,brand_id,price,old_price,discount,image,ram,storage,description,stock,views,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),category_id=VALUES(category_id),brand_id=VALUES(brand_id),price=VALUES(price),old_price=VALUES(old_price),discount=VALUES(discount),image=VALUES(image),ram=VALUES(ram),storage=VALUES(storage),description=VALUES(description),stock=VALUES(stock),views=VALUES(views),status=VALUES(status)";
                }
                $pdo->prepare($sql)->execute(array_merge([$id], $base));
                $ids[] = $id;
            } else {
                if ($hasIsNew) {
                    $sql = 'INSERT INTO products (name,slug,category_id,brand_id,price,old_price,discount,image,ram,storage,description,stock,views,status,is_new) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                } else {
                    $sql = 'INSERT INTO products (name,slug,category_id,brand_id,price,old_price,discount,image,ram,storage,description,stock,views,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                }
                $pdo->prepare($sql)->execute($base);
                $ids[] = (int)$pdo->lastInsertId();
            }
        }

        if ($ids) {
            $marks = implode(',', array_fill(0, count($ids), '?'));
            $pdo->prepare("DELETE FROM products WHERE id NOT IN ({$marks})")->execute($ids);
        } else {
            $pdo->exec('DELETE FROM products');
        }

        $pdo->commit();
        json_response(['success' => true, 'message' => 'Đã đồng bộ sản phẩm vào MySQL.']);
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Sync products error: ' . $e->getMessage());
        json_response(['success' => false, 'message' => 'Không thể lưu sản phẩm vào database.'], 500);
    }
}

json_response(['success' => false, 'message' => 'Method không được hỗ trợ.'], 405);
