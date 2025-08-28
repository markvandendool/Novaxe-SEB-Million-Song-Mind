<?php 
	include_once(__DIR__ . '/Database.class.php'); 

	header('Content-type: application/json');
	$received = json_decode(file_get_contents('php://input'));

	$usermail 		= $received->user_email;
	$password 		= $received->user_pass;
	
	// Debug logging
	// error_log("Login attempt for: " . $usermail);


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
		$queryStr = "SELECT * FROM user WHERE LOWER(email)=LOWER('$usermail')";
		$result = $conn->query($queryStr);
		$user = $result->fetch(PDO::FETCH_ASSOC);
		return $user;	
	}

	function check_existing_user($conn,$usermail){
		$result = get_user_by_mail($conn, $usermail);

		if ($result === false) 
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
		error_log("log_user called with email: " . $usermail);

		if($usermail == '' && $password == '') return '{"error":"0"}';
		if($usermail == '') return '{"error":"-1"}';
	
		$user_exists = check_existing_user($conn,$usermail);
		error_log("User exists check: " . ($user_exists ? "true" : "false"));
	
		if($user_exists == false) return '{"error":"-1"}';

		$validation = verify_password($conn,$usermail,$password);
		error_log("Password validation: " . ($validation ? "true" : "false"));

		if($validation==true){
			error_log("Password validation passed, proceeding with user lookup");
			$queryStr = "SELECT * FROM user WHERE LOWER(email)=LOWER('$usermail')";
			$found = [];
			foreach ($conn->query($queryStr) as $row){
		 		array_push($found, $row);
			}
			error_log("Found " . sizeof($found) . " users");
			if ( sizeof($found) == 1 ) {
				error_log("Checking password verification");
				error_log("User row: " . print_r($found[0], true));
				$verify = password_verify($password, $found[0]['pass']);
				error_log("password_verify result: " . ($verify ? "true" : "false"));
				if ($verify){
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
		
		// If we reach here, something went wrong
		return '{"error":"Login failed"}';
	}

	function verify_password($conn,$usermail,$password){

		$queryStr = "SELECT * FROM user WHERE LOWER(email)=LOWER('$usermail')";
		$result = $conn->query($queryStr);
		$user = $result->fetch(PDO::FETCH_ASSOC);
		error_log("verify_password user: " . print_r($user, true));

		if ($user !== false){ /* Check if the password matches using password_verify(). */
			$verify = password_verify($password, $user['pass']);
			error_log("verify_password password_verify result: " . ($verify ? "true" : "false"));
			if ($verify){
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
	if(!$conn) {
		echo '{"error":"Database connection failed"}';
		return;
	}

	$return = log_user($conn,$usermail,$password);	
	// error_log("Login result: " . $return);
	
	if (empty($return)) {
		echo '{"error":"Empty response from log_user"}';
	} else {
		echo $return;
	}

	?>