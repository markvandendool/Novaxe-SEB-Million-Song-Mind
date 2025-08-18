<?php

    include './env.php'; 


    $curl = curl_init();
    $curl2 = curl_init();
    
    
    $sandMode = false;
    if($sandMode){
        $base = "https://api.sandbox.paypal.com/v1"; //sand
        $CLIENTID = $CLIENTID_sand;
        $PAYPAL_SECRET = $PAYPAL_SECRET_sand;
    }else{
        $base= "https://api.paypal.com/v1";
    }

    curl_setopt_array($curl, array(
    CURLOPT_URL => $base."/oauth2/token",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_USERPWD => $CLIENTID.":".$PAYPAL_SECRET,
    CURLOPT_POSTFIELDS => "grant_type=client_credentials",
    CURLOPT_HTTPHEADER => array(
    "Accept: application/json",
    "Accept-Language: en_US"
    ),
    ));

    $result= curl_exec($curl);

    $array=json_decode($result, true); 
    $token=$array['access_token'];

    curl_setopt_array($curl2, array(
        CURLOPT_URL => $base."/identity/generate-token",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_HTTPHEADER => array(
        "Accept: application/json",
        "Accept-Language: en_US",
        "Authorization: Bearer ".$token
        ),
        ));

        $result2 = curl_exec($curl2);
        $array=json_decode($result2, true); 


    echo json_encode($array);
    
?>