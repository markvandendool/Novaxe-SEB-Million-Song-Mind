<?php
// Simple router for PHP development server
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string
$path = parse_url($request_uri, PHP_URL_PATH);

// Handle API requests
if (strpos($path, '.php') !== false) {
    // If it's a PHP file request, serve it directly
    if (file_exists(__DIR__ . $path)) {
        return false; // Let the server handle it normally
    }
    
    // If it's an API request with /api/ prefix, try to find the PHP file in api directory
    if (strpos($path, '/api/') === 0) {
        $api_path = str_replace('/api/', '/api/', $path);
        $php_file = __DIR__ . $api_path;
        if (file_exists($php_file)) {
            include $php_file;
            return true;
        }
    }
    
    // Try to find PHP file in api directory (for requests like /listSongs.php)
    $api_file = __DIR__ . '/api' . $path;
    if (file_exists($api_file)) {
        include $api_file;
        return true;
    }
}

// Handle shared files
if (strpos($path, '/shared/') === 0) {
    $shared_file = __DIR__ . $path;
    if (file_exists($shared_file)) {
        return false; // Let the server handle it normally
    }
}

// For all other requests, serve the Angular app
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
    return true;
}

// If nothing matches, return 404
http_response_code(404);
echo "404 Not Found";
return true;
?> 