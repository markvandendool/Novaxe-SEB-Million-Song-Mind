<?php
	include_once('./Database.class.php');
	
	header('Content-type: application/json');
	$received = json_decode(file_get_contents('php://input'));
	$key 		= $received->email_encrypt;
	$pass 		= $received->pass_encrypt;


	function connect(){

		try{
			$conn = Database::getInstance();
		}
		catch(PDOException $e){
			throw $e;
		}

	  return $conn;
	}	

	function get_user_by_mail($conn,$usermail,$pass){

		$query = "SELECT pass FROM user WHERE 1";
		$newpass = "";

		foreach ($conn->query($query) as $psw){
			if(md5($psw[0])==$pass)
	 			$newpass = $psw[0];
		}

		if($newpass!=""){
			$queryStr = "SELECT * FROM user WHERE email='$usermail' AND pass='$newpass'";
			$found = [];

			foreach ($conn->query($queryStr) as $row){
		 		array_push($found, $row);
			}

			if ( sizeof($found) == 1 ) {
				$nick 	= $found[0]['nick'];
				$folder = $found[0]['folder'];
				$email = $found[0]['email'];

				$object = new stdClass();
				
				$object->folder = $folder;
				$object->email = $email;
				$object->nick = $nick;

				return json_encode($object);
			} else 
		    	return "\nError: no infos for email ".$usermail;
		}else
		 	return "link error";
	}

	function get_existing_user($conn,$key,$pass){
		$queryStr = "SELECT email FROM user WHERE 1";
		foreach ($conn->query($queryStr) as $email){
			if(strcmp(md5($email[0]), $key)==0){
				$usermail=$email[0];
				return get_user_by_mail($conn, $usermail, $pass);
			}
		}
	    return "\nError: non-existing email";
	}

	//-------------LOGIC STARTS HERE 

	$conn = connect();
	if(!$conn) return;

	$return = get_existing_user($conn,$key,$pass);	

	echo $return;
	?>