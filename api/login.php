<?php
require_once __DIR__ . '/config.php';
session_start();

$data = getJsonBody();

if (empty($data['email']) || empty($data['password'])) {
    jsonResponse(['status' => 'error', 'message' => 'Email and password required'], 400);
}

try {
    $db = getDB();

    $stmt = $db->prepare("SELECT * FROM admins WHERE email = ?");
    $stmt->execute([trim($data['email'])]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($data['password'], $admin['password'])) {
        jsonResponse(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }

    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['clinic_name'] = $admin['clinic_name'];

    jsonResponse([
        'status' => 'success',
        'message' => 'Login successful',
        'clinic_name' => $admin['clinic_name']
    ]);

} catch (Exception $e) {
    jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
}