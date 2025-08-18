<?php

    require_once './vendor/braintree/braintree_php/lib/Braintree.php';
    include './env.php';

    $received = json_decode(file_get_contents('php://input'));

    $amount 		            = $received->amount;
	$nonceFromTheClient 		= $received->nonce;
	$deviceDataFromTheClient 	= $received->deviceData;

    $gateway = new Braintree\Gateway([
        'environment' => 'sandbox',
        'merchantId' => $merchantId,
        'publicKey' => $publicKey,
        'privateKey' => $privateKey
    ]);
    
    
    // Then, create a transaction:
    $result = $gateway->transaction()->sale([
        'amount' => $amount,
        'paymentMethodNonce' => $nonceFromTheClient,
        'deviceData' => $deviceDataFromTheClient,
        'options' => [ 'submitForSettlement' => True ]
    ]);

    if ($result->success) {
        print_r("success!: " . $result->transaction->id);
    } else if ($result->transaction) {
        print_r("Error processing transaction:");
        print_r("\n  code: " . $result->transaction->processorResponseCode);
        print_r("\n  text: " . $result->transaction->processorResponseText);
    } else {
        foreach($result->errors->deepAll() AS $error) {
        print_r($error->code . ": " . $error->message . "\n");
        }
    }
?>