<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

$data = getJsonBody();

if (!isset($data['total_beds']) || !isset($data['available_beds'])) {
    jsonResponse(['status' => 'error', 'message' => 'Missing fields'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    UPDATE beds
    SET total_beds = ?, available_beds = ?
    WHERE id = 1
");

$stmt->execute([
    $data['total_beds'],
    $data['available_beds']
]);

jsonResponse(['status' => 'success', 'message' => 'Beds updated']);