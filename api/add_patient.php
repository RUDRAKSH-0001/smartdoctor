<?php
/**
 * Add Patient API
 * POST /api/add_patient.php
 * Body: { name, age, gender, symptoms, oxygen_level }
 */
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/ai_engine.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'POST method required'], 405);
}

$data = getJsonBody();

// Validate required fields
$required = ['name', 'age', 'gender'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        jsonResponse(['status' => 'error', 'message' => "Missing required field: $field"], 400);
    }
}

try {
    $db = getDB();
    ensurePatientAssignmentColumns($db);

    // Generate unique patient code
    $code = strtoupper(substr(md5(uniqid()), 0, 3)) . '-' . strtoupper(substr(md5(time()), 0, 3));

    $age = (int)$data['age'];
    $oxygen = isset($data['oxygen_level']) && $data['oxygen_level'] !== '' ? (float)$data['oxygen_level'] : 98.0;

    // Calculate allocation
    if ($oxygen < 92) {
        $allocation = 'ICU';
    } elseif ($age > 60) {
        $allocation = 'High Dependency Bed';
    } else {
        $allocation = 'General Ward Bed';
    }

    // Run AI severity analysis (legacy/UI format)
    $ai = analyzePatient($data);

    $stmt = $db->prepare('INSERT INTO patients (patient_code, name, age, gender, symptoms, oxygen_level, severity, allocation, severity_score, status) 
                          VALUES (:code, :name, :age, :gender, :symptoms, :oxygen, :severity, :allocation, :score, :status)');

    $stmt->execute([
        ':code'       => $code,
        ':name'       => trim($data['name']),
        ':age'        => $age,
        ':gender'     => $data['gender'],
        ':symptoms'   => $data['symptoms'] ?? null,
        ':oxygen'     => $data['oxygen_level'] ?? null,
        ':severity'   => $ai['severity'],
        ':allocation' => $allocation,
        ':score'      => $ai['severity_score'],
        ':status'     => 'waiting',
    ]);

    $patientId = $db->lastInsertId();

    // Store AI analysis
    $stmt2 = $db->prepare('INSERT INTO ai_analysis (patient_id, severity_score, recommended_resource, confidence, rationale)
                           VALUES (:pid, :score, :resource, :conf, :rationale)');
    $stmt2->execute([
        ':pid'       => $patientId,
        ':score'     => $ai['severity_score'],
        ':resource'  => $ai['recommended_resource'],
        ':conf'      => $ai['confidence'],
        ':rationale' => json_encode($ai['rationale']),
    ]);

    jsonResponse([
        'status'     => 'success',
        'message'    => 'Patient added successfully',
        'patient_id' => $patientId,
        'patient_code' => $code,
        'ai_analysis' => $ai,
    ]);

} catch (Exception $e) {
    jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
}
