<?php
require_once 'db.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'submit_contact') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');
    
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng điền đủ thông tin bắt buộc.']);
        exit;
    }
    
    $stmt = $pdo->prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)');
    if ($stmt->execute([$name, $email, $subject, $message])) {
        echo json_encode(['success' => true, 'message' => 'Đã gửi liên hệ thành công.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống.']);
    }
    
} elseif ($action === 'submit_application') {
    $company = trim($_POST['company'] ?? '');
    $tax = trim($_POST['tax'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $website = trim($_POST['website'] ?? '');
    
    if (empty($company) || empty($email) || empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng điền đủ thông tin công ty.']);
        exit;
    }
    
    $stmt = $pdo->prepare('INSERT INTO applications (company_name, tax_id, email, phone, website, category) VALUES (?, ?, ?, ?, ?, ?)');
    if ($stmt->execute([$company, $tax, $email, $phone, $website, $category])) {
        echo json_encode(['success' => true, 'message' => 'Đã nộp hồ sơ xin gia nhập thành công.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống.']);
    }

} elseif ($action === 'get_articles') {
    $stmt = $pdo->query('SELECT * FROM articles WHERE status="published" ORDER BY created_at DESC');
    $articles = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $articles]);

} elseif ($action === 'get_directory') {
    $stmt = $pdo->query('SELECT * FROM directory WHERE status="active" ORDER BY name ASC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'get_events') {
    $stmt = $pdo->query('SELECT * FROM events ORDER BY date DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} elseif ($action === 'get_docs') {
    $stmt = $pdo->query('SELECT * FROM documents ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);

} else {
    echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ.']);
}
?>
