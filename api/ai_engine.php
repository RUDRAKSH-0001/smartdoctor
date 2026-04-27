<?php
/**
 * AI Engine — Separated Rule-based Triage and AI Explanation Layer
 */

function getSeverity(array $patient): array {
    $o2 = isset($patient['oxygen_level']) && $patient['oxygen_level'] !== '' ? (float)$patient['oxygen_level'] : 98.0;
    $age = isset($patient['age']) ? (int)$patient['age'] : 30;

    if ($o2 < 90) return ['score' => 9.0, 'label' => 'Critical'];
    if ($o2 < 92) return ['score' => 7.0, 'label' => 'High'];
    if ($age > 60) return ['score' => 5.0, 'label' => 'Moderate'];
    return ['score' => 3.0, 'label' => 'Low'];
}

function allocate(array $patient): string {
    $o2 = isset($patient['oxygen_level']) && $patient['oxygen_level'] !== '' ? (float)$patient['oxygen_level'] : 98.0;
    $age = isset($patient['age']) ? (int)$patient['age'] : 30;

    if ($o2 < 92) return 'ICU';
    if ($age > 60) return 'High Dependency Bed';
    return 'General Ward Bed';
}

/**
 * Main analysis function called by API
 */
function analyzePatient(array $data): array {
    $severityData = getSeverity($data);
    $allocationResult = allocate($data);
    
    // Map the string allocation to resource type for DB insertion
    $resourceType = 'general_bed';
    if ($allocationResult === 'ICU') {
        $resourceType = 'icu_bed';
    } elseif ($allocationResult === 'High Dependency Bed') {
        $resourceType = 'monitor';
    }

    // Determine DB Enum for severity (critical, moderate, stable)
    $dbSeverity = 'stable';
    if ($severityData['label'] === 'Critical' || $severityData['label'] === 'High') {
        $dbSeverity = 'critical';
    } elseif ($severityData['label'] === 'Moderate') {
        $dbSeverity = 'moderate';
    }

    // Simulate AI Explanation Layer
    $o2 = isset($data['oxygen_level']) && $data['oxygen_level'] !== '' ? $data['oxygen_level'] : '98';
    $age = $data['age'] ?? '30';
    $symptoms = $data['symptoms'] ?? 'None';
    
    $explanation = "";
    if ((float)$o2 < 92) {
        $explanation = "Low oxygen indicates respiratory distress";
    } elseif ((int)$age > 60) {
        $explanation = "Patient age places them in high risk category";
    } else {
        $explanation = "Patient vitals are stable";
    }

    // Create rationale structure for the frontend
    $rationale = [
        'markers' => [
            [
                'title' => 'AI Allocation Rationale',
                'icon' => 'psychology',
                'color' => 'cyan',
                'detail' => $explanation
            ]
        ]
    ];

    return [
        'severity'             => $dbSeverity,
        'severity_score'       => $severityData['score'],
        'recommended_resource' => $allocationResult,
        'resource_type'        => $resourceType,
        'confidence'           => 99.0, // Rule-based is highly confident
        'rationale'            => $rationale,
    ];
}

/**
 * Generate AI explanation for why a resource was allocated to a specific patient.
 */
function explainAllocation(array $patient, array $resource, array $allocation): array {
    $explanation = [
        'summary' => '',
        'factors' => [],
        'recommendation' => '',
    ];

    $name = $patient['name'];
    $score = $patient['severity_score'];
    $resourceName = $resource['name'];
    
    $explanation['summary'] = "Patient {$name} was allocated to {$resourceName} based on deterministic rules (Severity Score: {$score}/10).";

    if (!empty($allocation['ai_rationale'])) {
        $stored = json_decode($allocation['ai_rationale'], true);
        if (isset($stored['markers'])) {
            $explanation['factors'] = $stored['markers'];
        }
    }

    return $explanation;
}
