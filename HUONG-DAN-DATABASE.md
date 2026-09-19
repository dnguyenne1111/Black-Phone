# BlackPhone - phần Database cần hiểu

## 1. Luồng dữ liệu hiện tại

- Trang khách đọc **sản phẩm / danh mục / thương hiệu / bài viết** từ PHP API.
- Đăng ký gửi dữ liệu tới `api/auth.php?action=register` rồi PHP dùng `password_hash()` trước khi lưu bảng `users`.
- Đăng nhập kiểm tra bằng `password_verify()` và lưu trạng thái đăng nhập bằng **PHP Session**.
- Giỏ hàng vẫn dùng `localStorage` vì đây là dữ liệu tạm trên trình duyệt.
- Khi bấm **Đặt hàng**, `js/checkout.js` gửi sản phẩm tới `api/orders.php`.
- PHP tự lấy giá sản phẩm từ MySQL, tính lại tổng tiền rồi ghi vào `orders` và `order_items`.
- Admin Users và Orders đọc/cập nhật trực tiếp MySQL qua API.

## 2. Vì sao mật khẩu không được lưu chữ thường?

Không lưu `123456` trực tiếp trong database. PHP dùng:

```php
$hash = password_hash($password, PASSWORD_DEFAULT);
```

Khi đăng nhập:

```php
password_verify($password, $hash);
```

## 3. Quan hệ quan trọng

- `products.category_id -> categories.id`
- `products.brand_id -> brands.id`
- `orders.user_id -> users.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`

Một đơn hàng có nhiều dòng sản phẩm nên phải tách `orders` và `order_items`.

## 4. Việc bạn tự làm để hiểu bài

Sau khi chép source vào Laragon:

1. Mở `http://localhost/Black-Phone/api/setup.php` một lần.
2. Mở `http://localhost/Black-Phone/api/test-db.php` để kiểm tra kết nối.
3. Tạo thử một tài khoản ở `register.html`.
4. Vào phpMyAdmin/Navicat chạy:

```sql
SELECT id, full_name, email, phone, role, status, created_at
FROM users
ORDER BY id DESC;
```

5. Đặt thử một đơn rồi chạy:

```sql
SELECT * FROM orders ORDER BY id DESC;
SELECT * FROM order_items ORDER BY id DESC;
```

Nếu thấy dữ liệu xuất hiện ở MySQL thì bạn đã hiểu được luồng **HTML/JS -> PHP API -> MySQL**.

## 5. Admin demo

Nếu bạn đã tạo Admin trước đó, vẫn dùng tài khoản đó. API mới sẽ tự chuyển mật khẩu demo cũ sang dạng hash khi đăng nhập thành công. File `api/setup.php` cũng hỗ trợ mã hóa mật khẩu Admin cũ.

> Chức năng "Quên mật khẩu" hiện là bản demo cho đồ án. Hệ thống thật cần gửi mã/token xác minh qua email.
