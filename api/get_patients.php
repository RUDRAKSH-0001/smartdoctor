<?php
/**
 * Get Patients API
 * GET /api/get_patients.php
 * Optional query params: ?status=admitted&severity=critical&ward=ICU
 */
require_once __DIR__ . '/config.php';

try {
    $db = getDB();

    $sql = "SELECT id, name, age, gender, symptoms, oxygen_level, allocation, severity FROM patients ORDER BY created_at DESC";
    $stmt = $db->query($sql);
    $patients = $stmt->fetchAll();

    jsonResponse([
        'status'   => 'success',
        'count'    => count($patients),
        'patients' => $patients,
    ]);

} catch (Exception $e) {
    jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
}
