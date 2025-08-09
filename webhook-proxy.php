<?php
// webhook-proxy.php - Upload this file to your website root

// Enable CORS for your domain
header('Access-Control-Allow-Origin: https://hoteldilley.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the JSON data from the request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Validate that we have data
if (!$data || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit();
}

// Your Make.com webhook URL
$makeWebhookUrl = 'https://hook.us2.make.com/94ueeaka93vb0aifqweai46gnf0zho81';

// Log the incoming data (optional - for debugging)
error_log('Webhook proxy received: ' . $jsonData);

// Forward to Make.com using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $makeWebhookUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Log the Make.com response (optional - for debugging)
error_log('Make.com response (' . $httpCode . '): ' . $response);

// Handle cURL errors
if ($curlError) {
    error_log('cURL error: ' . $curlError);
    http_response_code(500);
    echo json_encode(['error' => 'Webhook forwarding failed']);
    exit();
}

// Return success response
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Lead submitted successfully',
    'make_status' => $httpCode
]);
?>