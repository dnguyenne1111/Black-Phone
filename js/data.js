/* =====================================================
   PHONESTORE - SHARED DATA (MYSQL API)
   Dùng chung cho USER + ADMIN
===================================================== */

function getApiBase() {
    return 'http://localhost:3000';
}

function apiSyncGet(endpoint) {
    try {
        const xhr = new XMLHttpRequest();
        const suffix = window.location.pathname.includes('/ADM/') ? '?all=1' : '';
        xhr.open('GET', `${getApiBase()}/${endpoint}${suffix}`, false);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();

        if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText);
            return result.success && Array.isArray(result.data) ? result.data : [];
        }

        console.error(`GET ${endpoint} thất bại:`, xhr.status, xhr.responseText);
    } catch (error) {
        console.error(`Không thể tải ${endpoint}:`, error);
    }

    return [];
}

function apiSyncSave(endpoint, data) {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${getApiBase()}/${endpoint}?action=sync`, false);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(JSON.stringify(data));

        let result = null;
        try {
            result = JSON.parse(xhr.responseText || '{}');
        } catch (_) {
            result = { success: false, message: 'Phản hồi API không hợp lệ.' };
        }

        if (xhr.status === 401 && window.location.pathname.includes('/ADM/')) {
            sessionStorage.removeItem('phonestore_admin_session');
            window.location.href = 'login.html';
            return result;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            return result;
        }

        console.error(`SAVE ${endpoint} thất bại:`, xhr.status, result);
        return result || { success: false };
    } catch (error) {
        console.error(`Không thể lưu ${endpoint}:`, error);
        return { success: false, message: 'Không thể kết nối API.' };
    }
}

function normalizeCategory(item) {
    return {
        ...item,
        id: Number(item.id),
        image: item.image || `images/categories/${item.slug}.webp`,
        url: item.url || `products.html?category=${encodeURIComponent(item.slug)}`
    };
}

function normalizeBrand(item) {
    return {
        ...item,
        id: Number(item.id),
        image: item.image || `images/brands/${item.slug}.webp`,
        url: item.url || `products.html?brand=${encodeURIComponent(item.name)}`
    };
}

function normalizeProduct(item) {
    return {
        ...item,
        id: Number(item.id),
        brand: item.brand ?? item.brand_name ?? '',
        category: item.category ?? item.category_slug ?? '',
        price: Number(item.price || 0),
        oldPrice: Number(item.oldPrice ?? item.old_price ?? 0),
        discount: Number(item.discount || 0),
        views: Number(item.views || 0),
        stock: Number(item.stock || 0),
        isNew: Boolean(Number(item.isNew ?? item.is_new ?? 0)),
        image: item.image || '',
        status: item.status || 'active'
    };
}

function normalizeArticle(item) {
    return {
        ...item,
        id: Number(item.id),
        description: item.description ?? item.summary ?? '',
        date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''),
        url: item.url || '#',
        status: item.status || 'published'
    };
}

let categories = apiSyncGet('categories.php').map(normalizeCategory);
let brands = apiSyncGet('brands.php').map(normalizeBrand);
let products = apiSyncGet('products.php').map(normalizeProduct);
let articles = apiSyncGet('articles.php').map(normalizeArticle);

function saveProducts(newProducts) {
    products = newProducts.map(normalizeProduct);
    return apiSyncSave('products.php', products);
}

function saveCategories(newCategories) {
    categories = newCategories.map(normalizeCategory);
    return apiSyncSave('categories.php', categories);
}

function saveBrands(newBrands) {
    brands = newBrands.map(normalizeBrand);
    return apiSyncSave('brands.php', brands);
}

function saveArticles(newArticles) {
    articles = newArticles.map(normalizeArticle);
    return apiSyncSave('articles.php', articles);
}

function resetPhoneStoreData() {
    alert('Dữ liệu hiện được lưu trong MySQL. Hãy quản lý bằng trang Admin.');
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(Number(price || 0)) + 'đ';
}
