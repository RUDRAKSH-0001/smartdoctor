<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

$data = getJsonBody();

if (empty($data['id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Patient ID required'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    UPDATE patients
    SET name = ?, age = ?, gender = ?, status = ?
    WHERE id = ?
");

$stmt->execute([
    $data['name'],
    $data['age'],
    $data['gender'],
    $data['status'],
    $data['id']
]);

jsonResponse(['status' => 'success', 'message' => 'Patient updated']);