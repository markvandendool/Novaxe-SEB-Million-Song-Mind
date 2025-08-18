<?php
    include './env.php'; 

    header('Content-type: application/json');
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    session_start();


    $received = json_decode(file_get_contents('php://input'));

    $a_id  = $received->id;

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
     

    function searchTop($artid){
        $authorization = "Authorization: Bearer " . $_SESSION["token"];
         
        $spotifyURL = 'https://api.spotify.com/v1/artists/'.$artid.'/top-tracks?market=US';
         
        $ch2 = curl_init();
         
        curl_setopt($ch2, CURLOPT_URL, $spotifyURL);
        curl_setopt($ch2,  CURLOPT_HTTPHEADER, array('Content-Type: application/json' , $authorization));
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

    getAccess($client_id, $client_secret);

    $return = searchTop($a_id);

    echo $return;
        
?>