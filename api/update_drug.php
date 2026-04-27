<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

$data = getJsonBody();

if (empty($data['id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Drug ID required'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    UPDATE drugs
    SET name = ?, quantity = ?, expiry_date = ?
    WHERE id = ?
");

$stmt->execute([
    $data['name'],
    $data['quantity'],
    $data['expiry_date'],
    $data['id']
]);

jsonResponse(['status' => 'success', 'message' => 'Drug updated']);