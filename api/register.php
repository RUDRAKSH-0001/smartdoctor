<?php
require_once __DIR__ . '/config.php';
session_start();

$data = getJsonBody();

if (
    empty($data['clinic_name']) ||
    empty($data['email']) ||
    empty($data['password'])
) {
    jsonResponse(['status' => 'error', 'message' => 'All fields required'], 400);
}

try {
    $db = getDB();

    // Check if email already exists
    $check = $db->prepare("SELECT id FROM admins WHERE email = ?");
    $check->execute([$data['email']]);

    if ($check->fetch()) {
        jsonResponse(['status' => 'error', 'message' => 'Email already registered'], 409);
    }

    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    $stmt = $db->prepare("INSERT INTO admins (clinic_name, email, password) VALUES (?, ?, ?)");
    $stmt->execute([
        trim($data['clinic_name']),
        trim($data['email']),
        $hashedPassword
    ]);

    jsonResponse(['status' => 'success', 'message' => 'Admin registered successfully']);

} catch (Exception $e) {
    jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
}