<?php

    require_once './vendor/braintree/braintree_php/lib/Braintree.php';


    
    $gateway = new Braintree\Gateway([
        'environment' => 'sandbox',
        'merchantId' => 'pn5gj6hjzgj87j8x',
        'publicKey' => '53wmjkdbnwhqkww2',
        'privateKey' => '153bc636ac8dc9be1e8ff2a20a210356'
    ]);
    
    $clientToken = $gateway->clientToken()->generate();
    echo $clientToken ;
    
?>