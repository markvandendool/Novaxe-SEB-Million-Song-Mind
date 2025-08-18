<?php

    include './env.php'; 

    header('Content-type: application/json');
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    session_start();

    $received = json_decode(file_get_contents('php://input'));

    $title  = $received->title;
    $artist = $received->artist;
    $album  = $received->album;
    $comp   = $received->comp;

    $client_id = $ID_SPOT; 
    $client_secret = $SECRET_SPOT;
    

    function getAccess($id, $secret){
    
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL,            'https://accounts.spotify.com/api/token' );
        curl_setopt($ch, CURLOPT_HTTPHEADER,     array('Authorization: Basic '.base64_encode($id.':'.$secret))); 
        curl_setopt($ch, CURLOPT_POSTFIELDS,     'grant_type=client_credentials' ); 
        curl_setopt($ch, CURLOPT_POST,           1 );
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:x.x.x) Gecko/20041107 Firefox/x.x");
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $json = curl_exec($ch);
        $json = json_decode($json);

        curl_close($ch);

        $_SESSION["token"]=$json->access_token;
        $_SESSION["exp_time"]=strtotime("+".$json->expires_in."seconds"); 
    }

    
    function searchSong($tit, $art, $alb, $component){

        $authorization = "Authorization: Bearer " . $_SESSION["token"];
        $spotifyURL = '';

        if($component == 'editor'){  

            $title_ok = (($tit!='Score title' && $tit != '' && $tit != ' ') ? true : false);
            $artist_ok = (($art!='unknown' && $art != '' && $art != ' ') ? true : false);

            if($title_ok && !$artist_ok){
              $spotifyURL = 'https://api.spotify.com/v1/search?q='.urlencode($tit).'&type=track&limit=50';
            }
            elseif($title_ok && $artist_ok){
              $spotifyURL = 'https://api.spotify.com/v1/search?q='.urlencode($art).'+'.urlencode($tit).'&type=track&limit=50';
            }

        } 


        else {
            $spotifyURL = 'https://api.spotify.com/v1/search?q='.urlencode($art).'+'.urlencode($tit).'&type=track';
        }
        

        $ch2 = curl_init();
         
        curl_setopt($ch2, CURLOPT_URL, $spotifyURL);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, array('Content-Type: application/json' , $authorization));
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch2, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:x.x.x) Gecko/20041107 Firefox/x.x");
        curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);

        $json2 = curl_exec($ch2);
        $json2 = json_decode($json2);

        curl_close($ch2);

        $data = json_encode((array)$json2);
        return $data;
    }


    function searchSongByArtist($art){
        $authorization = "Authorization: Bearer " . $_SESSION["token"];
         
        $spotifyURL = 'https://api.spotify.com/v1/search?q='.urlencode($art).'&type=artist';

         
        $ch2 = curl_init();
         
        curl_setopt($ch2, CURLOPT_URL, $spotifyURL);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, array('Content-Type: application/json' , $authorization));
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch2, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:x.x.x) Gecko/20041107 Firefox/x.x");
        curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);

        $json2 = curl_exec($ch2);
        $json2 = json_decode($json2);

        curl_close($ch2);

        $data = json_encode((array)$json2);
        return $data;
    }


    ////////////////LOGIC STARTS HERE!
    if( !isset($_SESSION['token']) || !isset($_SESSION['exp_time']) || ($_SESSION["exp_time"]>strtotime("now")) ){
        getAccess($client_id, $client_secret);
    }

    $res = '';

    if($title == '' && $album == '' && $comp != 'editor'){
        $res = searchSongByArtist($artist);
    }
    else{
        $res = searchSong($title, $artist, $album, $comp);
    }

    echo $res;

?>