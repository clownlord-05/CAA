<?php
header('Content-Type: application/json; charset=utf-8');

// Thông tin kết nối Database
$host = 'localhost';
$db   = 'caa_portal';
$user = 'root'; // Thay bằng user DB của Hosting
$pass = '';     // Thay bằng password DB của Hosting
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Quăng lỗi ra ngoài để dễ debug
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Trả về mảng liên hợp
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Bảo mật chống SQL Injection
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Trả về JSON lỗi kết nối thay vì HTML
    echo json_encode(['success' => false, 'message' => 'Lỗi kết nối CSDL: ' . $e->getMessage()]);
    exit;
}
?>
