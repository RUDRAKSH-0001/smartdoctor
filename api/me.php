<?php
require_once __DIR__ . '/config.php';
session_start();

if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['logged_in' => false]);
}

jsonResponse([
    'logged_in' => true,
    'clinic_name' => $_SESSION['clinic_name']
]);