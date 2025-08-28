<?php 
	include_once(__DIR__ . '/Database.class.php'); 

	header('Content-type: application/json');

	// Handle both GET and POST requests
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		$received = new stdClass();
		$received->id = $_GET['id'] ?? null;
	} else {
		$received = json_decode(file_get_contents('php://input'));
	}

	function connect(){

		try{
			$conn = Database::getInstance();
		}
		catch(PDOException $e){
			throw $e;
		}

	  return $conn;
	}	

	function getSong($conn,$id){
		$queryStr = "SELECT * FROM songs WHERE id='$id'";
		$song = null;
		foreach ($conn->query($queryStr) as $row) $song = $row;

		// Check if song was found
		if (!$song) {
			$out = new stdClass();
			$out->error = 'Song not found';
			return $out;
		}

		// $out = [];
		// $out = (object) array('infos' => '');
		$out = new stdClass();
		$out->infos = new stdClass();

		$out->infos->id = $song['id'];
		$out->infos->title = $song['title'];
		$out->infos->artist = $song['artist'];
		$out->infos->album = $song['album'];
		$out->infos->transcription = $song['author'];
		$out->infos->style = $song['style'];
		$out->infos->tonality = $song['tonality'];
		$out->infos->signature = $song['signature'];
		$out->infos->owner = $song['owner'];
		// $out->infos->price = $song['price'];
		$out->infos->img = $song['img'];

		// Set default values for missing files
		$out->infos->youtube_link = '';
		$out->infos->youtube_videoId = '';
		$out->infos->youtube_filePath = '';
		$out->infos->clef = 'treble';
		$out->parts = [];
		$out->chordsInScore = [];
		$out->params = new stdClass();

		// Try to load files if they exist
		$path = '../shared/scores/public/'.$id.'.json';
		$pathChords = '../shared/scores/public/'.$id.'.chords.json';
		$pathParams = '../shared/scores/public/'.$id.'.params.json';

		if (file_exists($path)) {
			$score = json_decode(file_get_contents($path));
			if ($score && isset($score->infos)) {
				$out->infos->youtube_link = $score->infos->youtube_link ?? '';
				$out->infos->youtube_videoId = $score->infos->youtube_videoId ?? '';
				$out->infos->youtube_filePath = $score->infos->youtube_filePath ?? '';
			}
			if ($score && isset($score->parts)) {
				$out->parts = $score->parts;
			}
		}

		if (file_exists($pathChords)) {
			$chords = json_decode(file_get_contents($pathChords));
			$out->chordsInScore = $chords ?? [];
		}

		if (file_exists($pathParams)) {
			$params = json_decode(file_get_contents($pathParams));
			$out->params = $params ?? new stdClass();
		}

		return $out;	
	}

	function getUserFolder($conn,$usr){

		$mail 		= $usr->user_email;
		$nick 		= $usr->userNick;
		$clearPass 	= $usr->user_pass;
		$pass 		= verify_password($conn,$mail,$clearPass);

		$queryStr = "SELECT folder FROM user WHERE email='$mail' AND nick='$nick' AND pass='$pass'";
		echo $queryStr;
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

	/*-------------LOGIC STARTS HERE-------------*/
	$conn = connect();
	if(!$conn) return;

	$list = getSong($conn,$received->id);	

	if (isset($list->error)) {
		http_response_code(404);
		echo json_encode($list);
	} else {
		echo json_encode($list);
	}
	
	// echo '{"test":"neeee"}'	
?>