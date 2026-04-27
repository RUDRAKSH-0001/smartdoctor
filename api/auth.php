<?php
require_once __DIR__ . '/config.php';
session_start();

if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}