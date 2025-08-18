<?php 
	include_once('./Database.class.php');
	
	header('Content-type: application/json');
	$received = json_decode(file_get_contents('php://input'));

	function connect(){

		try{
			$conn = Database::getInstance();
		}
		catch(PDOException $e){
			throw $e;
		}

	  return $conn;
	}	

	function deleteSong($conn,$id,$usr_id,$usr_folder){
		$queryStr = "DELETE FROM songs WHERE id='$id' AND owner='$usr_id'";

		$conn->exec($queryStr);

		if (!unlink('../shared/scores/'.$usr_folder.'/'.$id.'.json')) {  
		    echo ("$id cannot be deleted due to an error");  
		}  
		else {  
		    echo ("$id has been deleted");  
		}  	
		return ' song id : '.$id;
	}

	function getUserId($conn,$usr){

		$mail 		= $usr->user_email;
		$nick 		= $usr->userNick;
		$folder 	= $usr->user_folder;
		$clearPass 	= $usr->user_pass;
		$pass 		= verify_password($conn, $mail, $clearPass);

		$queryStr = "SELECT id FROM user WHERE email='$mail' AND nick='$nick' AND folder='$folder' AND pass='$pass'";
		$ids = [];
		foreach ($conn->query($queryStr) as $row) array_push($ids, $row['id']);

		return $ids[0];

	}	

	function getUserFolder($conn,$usr){

		$mail 		= $usr->user_email;
		$nick 		= $usr->userNick;
		$clearPass 	= $usr->user_pass;
		$pass 		= verify_password($conn, $mail, $clearPass);

		$queryStr = "SELECT folder FROM user WHERE email='$mail' AND nick='$nick' AND pass='$pass'";
		$folder = [];
		foreach ($conn->query($queryStr) as $row) array_push($folder, $row['folder']);

		return $folder[0];

	}

	function verify_password($conn,$usermail,$password){

		$queryStr = "SELECT * FROM user WHERE email='$usermail'";
		foreach ($conn->query($queryStr) as $row) $user = $row;

		if (is_array($user)){ /* Check if the password matches using password_verify(). */
			if (password_verify($password, $user['pass'])){
				return $user['pass'];
			} else{
				return '';
			}
		} else{
			return '';
		}
	}		

	/*-------------LOGIC STARTS HERE-------------*/
	$conn = connect();
	if(!$conn) return;

	$song_id = $received->id;
	$usr_id = getUserId($conn,$received->user);
	$usr_folder = getUserFolder($conn,$received->user);
	// print_r($usr_folder);

	echo deleteSong($conn, $song_id, $usr_id, $usr_folder);	

?>