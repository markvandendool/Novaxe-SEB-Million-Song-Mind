<?php

    include './env.php'; 
    header('Content-type: application/json');

    $received = json_decode(file_get_contents('php://input'));

    $title  = $received->title;
    $artist = $received->artist;
    $album  = $received->album;

    $url = 'https://api.discogs.com/database/search?q='.urlencode($title).'+'.urlencode($artist).'&key='.$KEY_DISC.'&secret='.$SECRET_DISC;


    $curl = curl_init();

    curl_setopt($curl, CURLOPT_USERAGENT, 'NOVAXE/0.1 +https://app.novaxe.com');
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        "Accept: application/json",
    ));

    $output = curl_exec($curl);

    curl_close ($curl);

    $array=json_decode($output, true); 

    echo json_encode($array);
    
?>