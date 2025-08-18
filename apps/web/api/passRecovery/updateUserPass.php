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

	function update_user($conn,$usermail,$password){

		if(check_existing_user($conn,$usermail) != true)return "error";

		$hash = password_hash($password, PASSWORD_DEFAULT);

		$queryStr = "UPDATE user SET pass='$hash' WHERE email='$usermail'";

		$nb = $conn->exec($queryStr);
		if ( $nb ) {
	    echo "User ".$usermail." updated successfully.";
		} else {
	    echo "\nError: " . $queryStr . "\n" . $conn->error;
		}
	}

	//-------------LOGIC STARTS HERE 

	$conn = connect();
	if(!$conn) return;

	$return = update_user($conn,$usermail,$password);	

	echo $return;
	?>