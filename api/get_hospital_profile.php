<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

$db = getDB();

// Example: fetch first admin as hospital profile
$stmt = $db->query("SELECT clinic_name, email FROM admins LIMIT 1");
$admin = $stmt->fetch();

$stmt2 = $db->query("SELECT total_beds FROM beds LIMIT 1");
$beds = $stmt2->fetch();

jsonResponse([
    "name" => $admin['clinic_name'] ?? "Smart Hospital",
    "summary" => "Centralized AI-driven medical command center",
    "doctor" => "Dr. Administrator",
    "city" => "Metropolis",
    "beds" => $beds['total_beds'] ?? 0,
    "contact" => $admin['email'] ?? "admin@hospital.com"
]);