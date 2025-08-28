<?php
// Simple router for PHP built-in server
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove leading slash and 'api/' prefix
$path = ltrim($path, '/');
$path = preg_replace('/^api\//', '', $path);

// Map routes to files
$routes = [
    'listSongs' => 'listSongs.php',
    'loadSong' => 'loadSong.php',
    'loadSong2' => 'loadSong2.php',
    'saveSong' => 'saveSong.php',
    'saveSong2' => 'saveSong2.php',
    'deleteSong' => 'deleteSong.php',
    'searchAnalysis' => 'searchAnalysis.php',
    'createUser' => 'createUser.php',
    'signIn' => 'signIn.php',
    'getHarmtraceAnalysis.php' => 'getHarmtraceAnalysis.php',
    'getWavFromYoutube.php' => 'getWavFromYoutube.php',
    'score/new_score' => 'listSongs.php', // Redirect to list for new score
];

// Handle the route
if (isset($routes[$path])) {
    $file = $routes[$path];
    if (file_exists($file)) {
        include $file;
        return;
    }
}

// Handle subdirectories
if (strpos($path, 'passRecovery/') === 0) {
    $subpath = substr($path, 13); // Remove 'passRecovery/'
    $file = "passRecovery/{$subpath}.php";
    if (file_exists($file)) {
        include $file;
        return;
    }
}

if (strpos($path, 'payment/') === 0) {
    $subpath = substr($path, 8); // Remove 'payment/'
    $file = "payment/{$subpath}.php";
    if (file_exists($file)) {
        include $file;
        return;
    }
}

if (strpos($path, 'discogs/') === 0) {
    $subpath = substr($path, 8); // Remove 'discogs/'
    $file = "discogs/{$subpath}.php";
    if (file_exists($file)) {
        include $file;
        return;
    }
}

if (strpos($path, 'spotify/') === 0) {
    $subpath = substr($path, 8); // Remove 'spotify/'
    $file = "spotify/{$subpath}.php";
    if (file_exists($file)) {
        include $file;
        return;
    }
}

if (strpos($path, 'getChords/') === 0) {
    $subpath = substr($path, 10); // Remove 'getChords/'
    $file = "getChords/{$subpath}.php";
    if (file_exists($file)) {
        include $file;
        return;
    }
}

// Default: return 404
http_response_code(404);
echo json_encode(['error' => 'Not found', 'path' => $path]);
?> 