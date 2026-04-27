<?php
/**
 * Smart Hospital — Database Configuration
 * Fill in your MySQL password below.
 */

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'smart_hospital');
define('DB_USER', 'root');
define('DB_PASS', '');  // <-- Fill your MySQL root password here

// Gemini API
define('GEMINI_API_KEY', 'AIzaSyALWy7LxqWj8MzEFZ5xybHanECVMmiAw28');

// CORS headers for frontend access
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get a PDO database connection
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/**
 * Send JSON response
 */
function jsonResponse(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Read JSON body from POST
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Check whether a table column exists.
 */
function columnExists(PDO $db, string $table, string $column): bool {
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table
          AND COLUMN_NAME = :column
    ");
    $stmt->execute([
        ':table' => $table,
        ':column' => $column,
    ]);

    return (int) $stmt->fetchColumn() > 0;
}

/**
 * Ensure patient resource-assignment columns exist for mixed old/new schemas.
 */
function ensurePatientAssignmentColumns(PDO $db): void {
    if (!columnExists($db, 'patients', 'allocation')) {
        $db->exec("ALTER TABLE patients ADD COLUMN allocation VARCHAR(50) NULL");
    }

    if (!columnExists($db, 'patients', 'assigned_resource')) {
        $db->exec("ALTER TABLE patients ADD COLUMN assigned_resource VARCHAR(50) NULL");
    }
}
