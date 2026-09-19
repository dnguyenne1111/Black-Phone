<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$categories = [
    ['iPhone', 'iphone', 'images/categories/iphone.webp'],
    ['Samsung', 'samsung', 'images/categories/samsung.webp'],
    ['Xiaomi', 'xiaomi', 'images/categories/xiaomi.webp'],
    ['OPPO', 'oppo', 'images/categories/oppo.webp'],
    ['Realme', 'realme', 'images/categories/realme.webp'],
    ['Vivo', 'vivo', 'images/categories/vivo.webp'],
];

$brands = [
    ['Apple', 'apple', 'images/brands/apple.webp'],
    ['Samsung', 'samsung', 'images/brands/samsung.webp'],
    ['Xiaomi', 'xiaomi', 'images/brands/xiaomi.webp'],
    ['OPPO', 'oppo', 'images/brands/oppo.webp'],
    ['Realme', 'realme', 'images/brands/realme.webp'],
    ['Vivo', 'vivo', 'images/brands/vivo.webp'],
];

$products = [
    ['iPhone 17 Pro Max','Apple','iphone',37990000,40990000,7,'12GB','256GB','images/products/iphone-17-pro-max.webp',950,1],
    ['Samsung Galaxy S26 Ultra','Samsung','samsung',32990000,35990000,8,'12GB','256GB','images/products/samsung-s26-ultra.webp',870,1],
    ['Xiaomi 16 Ultra','Xiaomi','xiaomi',24990000,26990000,7,'16GB','512GB','images/products/xiaomi-16-ultra.webp',760,1],
    ['OPPO Find X9 Pro','OPPO','oppo',22990000,24990000,8,'12GB','256GB','images/products/oppo-find-x9-pro.webp',690,1],
    ['iPhone 17','Apple','iphone',25990000,27990000,7,'8GB','256GB','images/products/iphone-17.webp',1250,0],
    ['Samsung Galaxy Z Flip','Samsung','samsung',23990000,25990000,8,'12GB','256GB','images/products/samsung-z-flip.webp',1180,0],
    ['Xiaomi 16','Xiaomi','xiaomi',17990000,19990000,10,'12GB','256GB','images/products/xiaomi-16.webp',1030,0],
    ['OPPO Reno 15 Pro','OPPO','oppo',15990000,17990000,11,'12GB','256GB','images/products/oppo-reno-15-pro.webp',980,0],
];

$articles = [
    ['Top điện thoại đáng mua hiện nay','top-dien-thoai-dang-mua-hien-nay','images/articles/article-1.webp','Danh sách những mẫu điện thoại nổi bật với hiệu năng tốt và mức giá hấp dẫn.'],
    ['Cách chọn điện thoại phù hợp với nhu cầu','cach-chon-dien-thoai-phu-hop','images/articles/article-2.webp','Một số tiêu chí quan trọng giúp bạn lựa chọn smartphone phù hợp.'],
    ['Mẹo sử dụng điện thoại bền và tiết kiệm pin','meo-su-dung-dien-thoai-ben','images/articles/article-3.webp','Những mẹo đơn giản giúp điện thoại hoạt động ổn định và kéo dài tuổi thọ pin.'],
];

$hasIsNew = column_exists($pdo, 'products', 'is_new');
$pdo->beginTransaction();

try {
    if ((int)$pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn() === 0) {
        $stmt = $pdo->prepare("INSERT INTO categories (name, slug, image, status) VALUES (?, ?, ?, 'active')");
        foreach ($categories as $row) $stmt->execute($row);
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM brands')->fetchColumn() === 0) {
        $stmt = $pdo->prepare("INSERT INTO brands (name, slug, image, status) VALUES (?, ?, ?, 'active')");
        foreach ($brands as $row) $stmt->execute($row);
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM products')->fetchColumn() === 0) {
        $cat = $pdo->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
        $brand = $pdo->prepare('SELECT id FROM brands WHERE name = ? LIMIT 1');
        $sql = $hasIsNew
            ? "INSERT INTO products (name,slug,category_id,brand_id,price,old_price,discount,ram,storage,image,views,stock,is_new,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'active')"
            : "INSERT INTO products (name,slug,category_id,brand_id,price,old_price,discount,ram,storage,image,views,stock,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'active')";
        $insert = $pdo->prepare($sql);

        foreach ($products as $p) {
            $brand->execute([$p[1]]); $brandId = $brand->fetchColumn() ?: null;
            $cat->execute([$p[2]]); $categoryId = $cat->fetchColumn() ?: null;
            $values = [$p[0], make_slug($p[0]), $categoryId, $brandId, $p[3], $p[4], $p[5], $p[6], $p[7], $p[8], $p[9], 10];
            if ($hasIsNew) $values[] = $p[10];
            $insert->execute($values);
        }
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM articles')->fetchColumn() === 0) {
        $insert = $pdo->prepare("INSERT INTO articles (title,slug,image,summary,content,status) VALUES (?,?,?,?,?,'published')");
        foreach ($articles as $a) $insert->execute([$a[0], $a[1], $a[2], $a[3], '']);
    }

    $pdo->commit();
    json_response(['success' => true, 'message' => 'Đã nạp dữ liệu demo vào MySQL.']);
} catch (Throwable $e) {
    $pdo->rollBack();
    error_log('Seed error: ' . $e->getMessage());
    json_response(['success' => false, 'message' => 'Không thể nạp dữ liệu demo.'], 500);
}
