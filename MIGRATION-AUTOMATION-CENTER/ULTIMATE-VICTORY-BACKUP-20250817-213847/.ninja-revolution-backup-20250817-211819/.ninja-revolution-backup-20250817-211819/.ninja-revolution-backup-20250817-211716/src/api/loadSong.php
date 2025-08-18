<?php 
	include_once('./Database.class.php');
	header('Content-type: application/json');

	// $received = file_get_contents('php://input');
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

	function getSong($conn,$id){
		$queryStr = "SELECT * FROM songs WHERE id='$id'";
		foreach ($conn->query($queryStr) as $row) $song = $row;

		$parts = [];
		$queryStr = "SELECT * FROM parts WHERE song_id='$id'";
		foreach ($conn->query($queryStr) as $part) array_push($parts, $part);
		
		$song['parts'] = $parts;
		return $song;	
	}


	/*-------------LOGIC STARTS HERE-------------*/
	$conn = connect();
	if(!$conn) return;

	$list = getSong($conn,$received->id);	

	echo json_encode($list);
	
	// echo '{"test":"neeee"}'	
?>