<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type');
	include_once(__DIR__ . '/Database.class.php');

require './PHPMailer-master/src/Exception.php';
require './PHPMailer-master/src/PHPMailer.php';
require './PHPMailer-master/src/SMTP.php';

  $received = json_decode(file_get_contents('php://input'));

  $usermail = $received->user_email;
  $path     = $received->adress;

  function connect(){

    try{
      $conn = Database::getInstance();
    }
    catch(PDOException $e){
      throw $e;
    }

    return $conn;
  } 


  function get_user_by_mail($conn,$usermail){
    $queryStr = "SELECT * FROM user WHERE email='$usermail'";
    foreach ($conn->query($queryStr) as $row) $user = $row;

    return $user; 
  }

  function check_existing_user($conn,$usermail){
    $result = get_user_by_mail($conn, $usermail);

    if (count($result) == 0) 
      return false;
    else
      return true;
  }

  function send_email($conn,$usermail,$path){

    if(check_existing_user($conn,$usermail)==true){

      $queryStr = "SELECT * FROM user WHERE email='$usermail'";
      $found = [];
      foreach ($conn->query($queryStr) as $row){
        array_push($found, $row);
      }

      if ( sizeof($found) == 1 ) {
        $email=$found[0]['email'];
        $pass=$found[0]['pass'];
        $nick=$found[0]['nick'];

        $link_path = $path.md5($email)."&reset=".md5($pass);


        $subject = "Reset password on your Novaxe account";
        $message = "Hello ".$nick." ! \nPlease click on the link below to reset your Novaxe account password : \n".$link_path."\n\nThank you ! \nNovaxe Team";
        $headers_for_client = array("From" => "noreply@novaxe.com");


        if(mail($email,$subject,$message,$headers_for_client) == false){
          // echo "Mailer Error: " . $mail->ErrorInfo;
          $data['success'] = false;
          return '{"code":"0"}';
        } else{
          $data['success'] = true;
          return '{"code":"1"}';
        }
      } else{
        $data['success'] = false;
        return '{"code":"-1"}';
      } 
    } else{
        $data['success'] = false;
        return '{"code":"-1"}';
    }
  }

  //-------------LOGIC STARTS HERE 

  $conn = connect();
  if(!$conn) return;

  $return = send_email($conn,$usermail,$path);  
  echo $return;
?>