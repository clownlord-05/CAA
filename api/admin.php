<?php
session_start();
require_once 'db.php';

// Kiểm tra quyền Admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Chỉ Admin mới truy cập được.']);
    exit;
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

function handleUpload($file) {
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) return null;
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed)) return null;
    
    $filename = uniqid('img_') . '.' . $ext;
    $dest = '../assets/media/' . $filename;
    
    if (!is_dir('../assets/media/')) {
        mkdir('../assets/media/', 0777, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $dest)) {
        return 'assets/media/' . $filename;
    }
    return null;
}


// ── TỔNG QUAN ────────────────────────────────────────────
if ($action === 'get_dashboard_stats') {
    $pendingApps    = $pdo->query('SELECT COUNT(*) FROM applications WHERE status = "pending"')->fetchColumn();
    $totalMembers   = $pdo->query('SELECT COUNT(*) FROM users WHERE role = "member" AND status = "active"')->fetchColumn();
    $unreadContacts = $pdo->query('SELECT COUNT(*) FROM contacts WHERE status = "unread"')->fetchColumn();
    $totalArticles  = $pdo->query('SELECT COUNT(*) FROM articles')->fetchColumn();

    echo json_encode(['success' => true, 'stats' => [
        'pending_apps'     => (int)$pendingApps,
        'total_members'    => (int)$totalMembers,
        'unread_contacts'  => (int)$unreadContacts,
        'total_articles'   => (int)$totalArticles,
    ]]);

// ── LIÊN HỆ ─────────────────────────────────────────────
} elseif ($action === 'get_contacts') {
    $stmt = $pdo->query('SELECT * FROM contacts ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'mark_contact_read') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE contacts SET status = "read" WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true]);

} elseif ($action === 'delete_contact') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM contacts WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Đã xóa thư liên hệ.']);

// ── YÊU CẦU GIA NHẬP ────────────────────────────────────
} elseif ($action === 'get_applications') {
    $stmt = $pdo->query('SELECT * FROM applications ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'approve_application') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE applications SET status = "approved" WHERE id = ?')->execute([$id]);
    
    // Fetch the application and insert into directory
    $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = ?');
    $stmt->execute([$id]);
    $app = $stmt->fetch();
    if ($app) {
        $stmtInsert = $pdo->prepare('INSERT INTO directory (name, contact_email, phone, website, category, status) VALUES (?, ?, ?, ?, ?, "active")');
        $stmtInsert->execute([$app['company_name'], $app['email'], $app['phone'], $app['website'], $app['category']]);
    }
    
    echo json_encode(['success' => true, 'message' => 'Đã duyệt hồ sơ.']);

} elseif ($action === 'reject_application') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE applications SET status = "rejected" WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Đã từ chối hồ sơ.']);

} elseif ($action === 'delete_application') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM applications WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Đã xóa hồ sơ.']);

// ── TÀI KHOẢN & PHÂN QUYỀN ──────────────────────────────
} elseif ($action === 'get_users') {
    $stmt = $pdo->query('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'create_user') {
    $email  = trim($_POST['email'] ?? '');
    $pass   = $_POST['password'] ?? '123456';
    $role   = $_POST['role'] ?? 'member';

    if (empty($email)) { echo json_encode(['success' => false, 'message' => 'Thiếu email.']); exit; }

    $check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $check->execute([$email]);
    if ($check->fetch()) { echo json_encode(['success' => false, 'message' => 'Email đã tồn tại.']); exit; }

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $pdo->prepare('INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, "active")')
        ->execute([$email, $hash, $role]);
    echo json_encode(['success' => true, 'message' => "Đã tạo tài khoản $email. Mật khẩu mặc định: $pass"]);

} elseif ($action === 'update_user_role') {
    $id   = (int)($_POST['id'] ?? 0);
    $role = $_POST['role'] ?? 'member';
    $pdo->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $id]);
    echo json_encode(['success' => true, 'message' => 'Đã cập nhật quyền.']);

} elseif ($action === 'reset_user_password') {
    $id      = (int)($_POST['id'] ?? 0);
    $newPass = $_POST['new_password'] ?? '123456';
    $hash    = password_hash($newPass, PASSWORD_DEFAULT);
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $id]);
    echo json_encode(['success' => true, 'message' => "Mật khẩu đã đặt lại thành: $newPass"]);

} elseif ($action === 'delete_user') {
    $id = (int)($_POST['id'] ?? 0);
    // Không cho xóa chính mình
    if ($id === (int)$_SESSION['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Không thể xóa tài khoản đang đăng nhập.']);
        exit;
    }
    $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Đã xóa tài khoản.']);

// ── BÀI VIẾT (CMS) ──────────────────────────────────────
} elseif ($action === 'get_articles') {
    $stmt = $pdo->query('SELECT id, title, category, status, created_at FROM articles ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'get_article') {
    $id   = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM articles WHERE id = ?');
    $stmt->execute([$id]);
    $article = $stmt->fetch();
    echo json_encode(['success' => true, 'data' => $article]);

} elseif ($action === 'create_article') {
    $title    = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $content  = trim($_POST['content'] ?? '');
    $status   = $_POST['status'] ?? 'published';

    if (empty($title)) { echo json_encode(['success' => false, 'message' => 'Tiêu đề không được để trống.']); exit; }

    
    $image_url = null;
    if (isset($_FILES['image'])) {
        $image_url = handleUpload($_FILES['image']);
    }
    $pdo->prepare('INSERT INTO articles (title, category, content, status, image_url) VALUES (?, ?, ?, ?, ?)')
        ->execute([$title, $category, $content, $status, $image_url]);

    echo json_encode(['success' => true, 'message' => 'Đã đăng bài viết mới.']);

} elseif ($action === 'update_article') {
    $id       = (int)($_POST['id'] ?? 0);
    $title    = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $content  = trim($_POST['content'] ?? '');
    $status   = $_POST['status'] ?? 'published';

    
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image_url = handleUpload($_FILES['image']);
        if ($image_url) {
            $pdo->prepare('UPDATE articles SET title = ?, category = ?, content = ?, status = ?, image_url = ? WHERE id = ?')
                ->execute([$title, $category, $content, $status, $image_url, $id]);
        } else {
            // failed upload, just update text
            $pdo->prepare('UPDATE articles SET title = ?, category = ?, content = ?, status = ? WHERE id = ?')
                ->execute([$title, $category, $content, $status, $id]);
        }
    } else {
        $pdo->prepare('UPDATE articles SET title = ?, category = ?, content = ?, status = ? WHERE id = ?')
            ->execute([$title, $category, $content, $status, $id]);
    }

    echo json_encode(['success' => true, 'message' => 'Đã cập nhật bài viết.']);

} elseif ($action === 'delete_article') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM articles WHERE id = ?')->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Đã xóa bài viết.']);


// ==========================================
// DANH BẠ HỘI VIÊN (DIRECTORY)
// ==========================================
} elseif ($action === 'get_directory') {
    $stmt = $pdo->query('SELECT * FROM directory ORDER BY name ASC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'create_dir') {
    $logo_url = null;
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $logo_url = handleUpload($_FILES['logo']);
    }
    $stmt = $pdo->prepare('INSERT INTO directory (name, short_name, contact_email, website, category, status, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$_POST['name'], $_POST['short'], $_POST['email'], $_POST['web'], $_POST['cat'], $_POST['status'], $logo_url]);
    echo json_encode(['success' => true]);

} elseif ($action === 'edit_dir') {
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $logo_url = handleUpload($_FILES['logo']);
        if ($logo_url) {
            $stmt = $pdo->prepare('UPDATE directory SET name = ?, short_name = ?, contact_email = ?, website = ?, category = ?, status = ?, logo_url = ? WHERE id = ?');
            $stmt->execute([$_POST['name'], $_POST['short'], $_POST['email'], $_POST['web'], $_POST['cat'], $_POST['status'], $logo_url, $_POST['id']]);
        } else {
            $stmt = $pdo->prepare('UPDATE directory SET name = ?, short_name = ?, contact_email = ?, website = ?, category = ?, status = ? WHERE id = ?');
            $stmt->execute([$_POST['name'], $_POST['short'], $_POST['email'], $_POST['web'], $_POST['cat'], $_POST['status'], $_POST['id']]);
        }
    } else {
        $stmt = $pdo->prepare('UPDATE directory SET name = ?, short_name = ?, contact_email = ?, website = ?, category = ?, status = ? WHERE id = ?');
        $stmt->execute([$_POST['name'], $_POST['short'], $_POST['email'], $_POST['web'], $_POST['cat'], $_POST['status'], $_POST['id']]);
    }
    echo json_encode(['success' => true]);

} elseif ($action === 'delete_dir') {
    $pdo->prepare('DELETE FROM directory WHERE id = ?')->execute([$_POST['id']]);
    echo json_encode(['success' => true]);

// ==========================================
// SỰ KIỆN (EVENTS)
// ==========================================
} elseif ($action === 'get_events') {
    $stmt = $pdo->query('SELECT * FROM events ORDER BY date DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'create_event') {
    $stmt = $pdo->prepare('INSERT INTO events (title, date, time, location, status, registration_link) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$_POST['title'], $_POST['date'], $_POST['time'], $_POST['location'], $_POST['status'], $_POST['link']]);
    echo json_encode(['success' => true]);

} elseif ($action === 'edit_event') {
    $stmt = $pdo->prepare('UPDATE events SET title = ?, date = ?, time = ?, location = ?, status = ?, registration_link = ? WHERE id = ?');
    $stmt->execute([$_POST['title'], $_POST['date'], $_POST['time'], $_POST['location'], $_POST['status'], $_POST['link'], $_POST['id']]);
    echo json_encode(['success' => true]);

} elseif ($action === 'delete_event') {
    $pdo->prepare('DELETE FROM events WHERE id = ?')->execute([$_POST['id']]);
    echo json_encode(['success' => true]);

// ==========================================
// TÀI LIỆU (DOCUMENTS)
// ==========================================
} elseif ($action === 'get_docs') {
    $stmt = $pdo->query('SELECT * FROM documents ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'create_doc') {
    $stmt = $pdo->prepare('INSERT INTO documents (title, category, file_url, access_level) VALUES (?, ?, ?, ?)');
    $stmt->execute([$_POST['title'], $_POST['cat'], $_POST['url'], $_POST['access']]);
    echo json_encode(['success' => true]);

} elseif ($action === 'edit_doc') {
    $stmt = $pdo->prepare('UPDATE documents SET title = ?, category = ?, file_url = ?, access_level = ? WHERE id = ?');
    $stmt->execute([$_POST['title'], $_POST['cat'], $_POST['url'], $_POST['access'], $_POST['id']]);
    echo json_encode(['success' => true]);

} elseif ($action === 'delete_doc') {
    $pdo->prepare('DELETE FROM documents WHERE id = ?')->execute([$_POST['id']]);
    echo json_encode(['success' => true]);

} else {
    echo json_encode(['success' => false, 'message' => 'Action không hợp lệ: ' . htmlspecialchars($action)]);
}
?>
