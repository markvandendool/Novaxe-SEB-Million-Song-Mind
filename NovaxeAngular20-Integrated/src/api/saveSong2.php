<?php 
	include_once(__DIR__ . '/Database.class.php');

	header('Content-type: application/json');

	$received = json_decode(file_get_contents('php://input'));
	$infos 	  = $received->infos;
	$parts 	  = $received->parts;
	$chords   = $received->chordsInScore;
	$params   = $received->params;
	$usr 	  = $received->usr;

	//checks for empty titles.
	if($infos->title == "" || $infos->title == "Score title"){
		echo (customError(512,'wrong title'));
		return; 
	}

	$conn = connect();
	$song_id = insertOrUpdate($conn, $infos, $parts, $usr);
	
	if($song_id == ''){
		echo customError(2,'id error');
		exit;
	}
	
	$score = new stdClass();
	$score->infos = $infos;
	$score->parts = $parts;

	$chordsFile = new stdClass();
	$chordsFile->chordsInScore = $chords;
	
	$paramsFile = new stdClass();
	$paramsFile->params = $params;
	
	file_put_contents('../shared/scores/public/'.$song_id.'.json', json_encode($score));
	file_put_contents('../shared/scores/public/'.$song_id.'.chords.json', json_encode($chords));
	file_put_contents('../shared/scores/public/'.$song_id.'.params.json', json_encode($params));
	
	// error_log("LE SONG ID en save est : ".$song_id);
	
	$song_id = preg_replace('/(\v|\s|\t)+/', '', $song_id);
	error_log("=============================>"."coucou");
	error_log("=============================>".$song_id);
	echo($song_id);
	// $conn->close();
	// echo $received->title;



	function connect(){

		try{
			$conn = Database::getInstance();
		}
		catch(PDOException $e){
			throw $e;
		}

	  return $conn;
	}	



	function insertOrUpdate($conn, $infos, $parts, $usr){

		// if($id == -1) $result = getScoreId($conn, $infos);

		$result = getScoreById($conn, $infos->songId);

		if (count($result) == 0) {
	    	// echo "\nNew score : creating\n";
			$song_id = insertSong($conn, $infos, $usr);
			// $song_id = getScoreId($conn, $infos)[0];
			// insertParts($conn, $song_id, $parts);
		} else {
		    // echo "\nScore already exists : updating\n";
		    $owner = getScoreOwner($conn,$result[0]);
		    $id = getUserId($conn, $usr);

		    if($id == $owner) $song_id = updateSong($conn, $infos, $usr);
			else echo (customError(512,'wrong owner'));
		}

		// $song_id = str_replace(array("\r\n", "\r", "\n", "\t"," "), '', $song_id);
		return $song_id;
	}


	function getScoreId($conn, $infos){

		$queryStr = "SELECT id FROM songs WHERE title='$infos->title' AND artist='$infos->artist' AND author='$infos->transcription' AND style='$infos->style'";

		$ids = [];
		foreach ($conn->query($queryStr) as $row)
			array_push($ids, $row['id']); 

		return $ids;
	}

	function getScoreOwner($conn, $id){

		$queryStr = "SELECT owner FROM songs WHERE id='$id'";

		$owner = [];
		foreach ($conn->query($queryStr) as $row)
			array_push($owner, $row['owner']); 

		return $owner[0];
	}

	function getScoreById($conn, $id){

		$queryStr = "SELECT id FROM songs WHERE id='$id'";

		$ids = [];
		foreach ($conn->query($queryStr) as $row)
			array_push($ids, $row['id']); 

		return $ids;
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
		$ids = [];
		foreach ($conn->query($queryStr) as $row) array_push($ids, $row['id']);

		return $ids;

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

	function insertSong($conn, $infos, $usr){

		$title = $infos->title;
		$artist = $infos->artist;
		$album = $infos->album;
		$author = $usr->userNick;
		$style = $infos->style;
		$tonality = $infos->tonality;
		$signature = $infos->signature;
		// $price = $infos->price;
		$img = $infos->img;
		$owner = getUserId($conn,$usr);
		// error_log("THE OWNER IS : ".$owner);

		$infos->transcription = $author;

		// if (count($owner) != 1) {
		// 	// error
		// } 





		// **********************************************************************************************
		// **********************************************************************************************
		// **********************************************************************************************
		// TODO: REPLACE $queryStr = "INSERT INTO songs(title,artist,album,author,style,tonality,signature,owner,price,img) VALUES('$title', '$artist', '$album' ,'$author', '$style', '$tonality', '$signature', '$owner', '$price', '$img' )"; FOR STORE
		// **********************************************************************************************
		// **********************************************************************************************
		// **********************************************************************************************

		$queryStr = "INSERT INTO songs(title,artist,album,author,style,tonality,signature,owner,img) VALUES('$title', '$artist', '$album' ,'$author', '$style', '$tonality', '$signature', '$owner', '$img')";

		$nb = $conn->exec($queryStr);
		if ( $nb ) {
			error_log("\nNew record created ".$nb." successfully.\n");
			$id = getScoreId($conn, $infos)[0];
			return $id;
			// echo $id;

		} else {
	    return "\nError: " . $queryStr . "\n" . $conn->error;
		}
	}



	function updateSong($conn, $infos,$usr){

		$id = $infos->songId;
		$title = $infos->title;
		$artist = $infos->artist;
		$album = $infos->album;
		$author = $usr->userNick;
		$style = $infos->style;
		$tonality = $infos->tonality;
		$signature = $infos->signature;
		// $price = $infos->price;
		$img = $infos->img;

		$statement = $conn->prepare("UPDATE songs SET title=:title WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('title', $title, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();


		//***********************
		$statement = $conn->prepare("UPDATE songs SET artist=:artist WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('artist', $artist, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();


		//***********************

		$statement = $conn->prepare("UPDATE songs SET album=:album WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('album', $album, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		//***********************

		$statement = $conn->prepare("UPDATE songs SET author=:author WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('author', $author, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		//***********************

		$statement = $conn->prepare("UPDATE songs SET style=:style WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('style', $style, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		//***********************

		$statement = $conn->prepare("UPDATE songs SET signature=:signature WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('signature', $signature, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		//***********************

		// $statement = $conn->prepare("UPDATE songs SET price=:price WHERE id=:id");
		// if ($statement === false) {
		// 	echo 'erreur statement';
		//   return;
		// }
		// $statement->bindParam('price', $price, PDO::PARAM_STR);	
		// $statement->bindParam('id', $id, PDO::PARAM_INT);	
		// $statement = $statement->execute();

		//***********************

		$statement = $conn->prepare("UPDATE songs SET img=:img WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('img', $img, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();


		//***********************

		$statement = $conn->prepare("UPDATE songs SET tonality=:tonality WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('tonality', $tonality, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		return $id;
	}

	//error handler function
	function customError($errno, $errstr) {
	  echo "[$errno] $errstr";
	}
?>
