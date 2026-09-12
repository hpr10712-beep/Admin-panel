<?php
// api.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

/**
 * Fungsi untuk memanggil API NexusSMM
 */
function callNexusAPI($endpoint, $data = []) {
    $url = NEXUS_BASE_URL . $endpoint;
    
    // Tambahkan kredensial ke setiap request
    $data['api_id'] = NEXUS_API_ID;
    $data['api_key'] = NEXUS_API_KEY;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    // NexusSMM meminta format application/x-www-form-urlencoded (sesuai gambar)
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Untuk testing, sebaiknya true di production
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return json_encode(['status' => false, 'message' => 'cURL Error: ' . $error]);
    }
    
    return $response;
}

// Ambil aksi dari frontend
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'get_services':
        // Sesuaikan endpoint '/services' dengan dokumentasi NexusSMM
        // Jika ada parameter lain seperti negara, tambahkan di sini
        echo callNexusAPI('/services', ['type' => 'otp']);
        break;

    case 'buy_nokos':
        // Sesuaikan endpoint '/order' dan nama parameternya dengan dokumentasi NexusSMM
        $data = [
            'service' => $_POST['service_id'] ?? '',
            'country' => $_POST['country_id'] ?? '',
            'quantity' => 1
        ];
        echo callNexusAPI('/order', $data);
        break;

    case 'check_status':
        // Sesuaikan endpoint '/status' dengan dokumentasi NexusSMM
        $data = [
            'order_id' => $_POST['order_id'] ?? ''
        ];
        echo callNexusAPI('/status', $data);
        break;

    default:
        echo json_encode(['status' => false, 'message' => 'Action tidak valid']);
        break;
}
?>
