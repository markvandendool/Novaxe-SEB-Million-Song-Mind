<?php 
	include_once(__DIR__ . '/Database.class.php'); 

	header('Content-type: application/json');
	$received = json_decode(file_get_contents('php://input'));

	$usermail 		= $received->user_email;
	$password 		= $received->user_pass;
	$nick 			= $received->user_nick;


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

	function get_user_by_nick($conn,$nick){
		$queryStr = "SELECT * FROM user WHERE nick='$nick'";
		foreach ($conn->query($queryStr) as $row) $user = $row;

		return $user;	
	}

	function check_existing_user_mail($conn,$usermail){
		$result = get_user_by_mail($conn, $usermail);

		if (count($result) == 0) 
			return false;
		else
			return true;
	}

	function check_existing_user_nick($conn,$nick){
		$result = get_user_by_nick($conn, $nick);

		if (count($result) == 0) 
			return false;
		else
			return true;
	}

	function create_user($conn,$usermail,$password,$nick){

		if(check_existing_user_mail($conn,$usermail) == true)return "email error";
		if(check_existing_user_nick($conn,$nick) == true)return "nick error";

		$hash = password_hash($password, PASSWORD_DEFAULT);

		$queryStr = "INSERT INTO user(email,pass,nick) VALUES('$usermail', '$hash', '$nick')";

		$nb = $conn->exec($queryStr);
		if ( $nb ) {
	    echo "\nNew user created ".$usermail." successfully.\n";
		} else {
	    echo "\nError: " . $queryStr . "\n" . $conn->error;
		}
	
	}

	//-------------LOGIC STARTS HERE 

	$conn = connect();
	if(!$conn) return;

	$return = create_user($conn,$usermail,$password,$nick);	

	echo "creating user : ".$return;
	?>