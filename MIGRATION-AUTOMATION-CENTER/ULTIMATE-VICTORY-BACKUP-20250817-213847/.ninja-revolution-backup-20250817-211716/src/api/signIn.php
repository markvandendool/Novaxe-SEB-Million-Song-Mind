<?php
	include_once('./Database.class.php'); 

	header('Content-type: application/json');
	$received = json_decode(file_get_contents('php://input'));

	$usermail 		= $received->user_email;
	$password 		= $received->user_pass;


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

	function get_nick($conn,$usermail){
		$queryStr = "SELECT nick FROM user WHERE email='$usermail'";

		$nick = $conn->query($queryStr);
		// echo $queryStr;

		return $nick;
	}

	function get_folder($conn,$usermail){
		$queryStr = "SELECT folder FROM user WHERE email='$usermail'";

		$folder = $conn->exec($queryStr);

		return $folder;

	}

	function log_user($conn,$usermail,$password){

		if($usermail == '' && $password == '') return '{"error":"0"}';
		if($usermail == '') return '{"error":"-1"}';
		if(check_existing_user($conn,$usermail) == false) return '{"error":"-1"}';

		$validation = verify_password($conn,$usermail,$password);

		if($validation==true){
			$queryStr = "SELECT * FROM user WHERE email='$usermail'";
			$found = [];
			foreach ($conn->query($queryStr) as $row){
		 		array_push($found, $row);
			}

			if ( sizeof($found) == 1 ) {
				if (password_verify($password, $found[0]['pass'])){
				$nick 	= $found[0]['nick'];
				$folder = $found[0]['folder'];
				$email = $found[0]['email'];

				$object = new stdClass();
				
				$object->folder = $folder;
				$object->email = $email;
				$object->nick = $nick;
				return json_encode($object);
			} else {
		    	return "\nError: ";
			}
			} else{
				return "Password error";
			}
		}
	}

	function verify_password($conn,$usermail,$password){

		$queryStr = "SELECT * FROM user WHERE email='$usermail'";
		foreach ($conn->query($queryStr) as $row) $user = $row;

		if (is_array($user)){ /* Check if the password matches using password_verify(). */
			if (password_verify($password, $user['pass'])){
				return true;
			} elseif ($password == $user['pass']){ /* Update the database with a new, secure hash. */
		    	$id=$user['id'];
				$hash = password_hash($password, PASSWORD_DEFAULT);
				$queryStr = "UPDATE user SET pass='$hash' WHERE id='$id'";
				$conn->exec($queryStr);
				return true;
			} else{
				return false;
			}
		} else{
			return false;
		}
	}

	



	//-------------LOGIC STARTS HERE 

	$conn = connect();
	if(!$conn) return;

	$return = log_user($conn,$usermail,$password,$nick);	
	echo $return;

	?>