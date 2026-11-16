<?php
session_start();
require_once 'db.php';

$action = $_POST['action'] ?? '';

if ($action === 'register') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đủ thông tin.']);
        exit;
    }
    
    // Check if email exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Tài khoản đã tồn tại, vui lòng đăng nhập.',
            'action' => 'redirect_login' // Flag để FE biết cần chuyển sang login
        ]);
        exit;
    }
    
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $otp = rand(100000, 999999);
    
    $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, role, status, verification_code) VALUES (?, ?, ?, ?, ?)');
    if ($stmt->execute([$email, $hash, 'member', 'inactive', $otp])) {
        echo json_encode(['success' => true, 'message' => 'Đăng ký thành công.', 'otp' => $otp]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống.']);
    }
    
} elseif ($action === 'verify_otp') {
    $email = trim($_POST['email'] ?? '');
    $otp = trim($_POST['otp'] ?? '');
    
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND verification_code = ?');
    $stmt->execute([$email, $otp]);
    $user = $stmt->fetch();
    
    if ($user) {
        $pdo->prepare('UPDATE users SET status = "active", verification_code = NULL WHERE id = ?')->execute([$user['id']]);
        echo json_encode(['success' => true, 'message' => 'Xác thực thành công! Bạn có thể đăng nhập.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Mã OTP không đúng hoặc đã hết hạn.']);
    }
    
} elseif ($action === 'forgot_password') {
    $email = trim($_POST['email'] ?? '');
    
    if (empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Vui lòng nhập email.']);
        exit;
    }
    
    $stmt = $pdo->prepare('SELECT id, status FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email này chưa được đăng ký trong hệ thống.']);
        exit;
    }
    
    $otp = rand(100000, 999999);
    $pdo->prepare('UPDATE users SET verification_code = ? WHERE email = ?')->execute([$otp, $email]);
    echo json_encode(['success' => true, 'message' => 'Đã gửi mã đặt lại mật khẩu.', 'otp' => $otp]);
    
} elseif ($action === 'reset_password') {
    $email = trim($_POST['email'] ?? '');
    $otp = trim($_POST['otp'] ?? '');
    $newPass = $_POST['new_password'] ?? '';
    
    if (empty($newPass) || strlen($newPass) < 6) {
        echo json_encode(['success' => false, 'message' => 'Mật khẩu phải có ít nhất 6 ký tự.']);
        exit;
    }
    
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND verification_code = ?');
    $stmt->execute([$email, $otp]);
    $user = $stmt->fetch();
    
    if ($user) {
        $hash = password_hash($newPass, PASSWORD_DEFAULT);
        $pdo->prepare('UPDATE users SET password_hash = ?, verification_code = NULL, status = "active" WHERE id = ?')
            ->execute([$hash, $user['id']]);
        echo json_encode(['success' => true, 'message' => 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Mã OTP không hợp lệ.']);
    }
    
} elseif ($action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        if ($user['status'] !== 'active') {
            echo json_encode(['success' => false, 'message' => 'Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư.']);
            exit;
        }
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['email'] = $user['email'];
        
        echo json_encode(['success' => true, 'message' => 'Đăng nhập thành công!', 'role' => $user['role'], 'email' => $user['email']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Sai email hoặc mật khẩu.']);
    }

} elseif ($action === 'check_session') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode(['success' => true, 'role' => $_SESSION['role'], 'email' => $_SESSION['email']]);
    } else {
        echo json_encode(['success' => false]);
    }
    
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Đã đăng xuất.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ.']);
}
?>
