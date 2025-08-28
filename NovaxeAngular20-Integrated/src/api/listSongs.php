<?php 
	include_once(__DIR__ . '/Database.class.php'); 

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

	function listSongs($conn){
		$queryStr = "SELECT * FROM songs ORDER BY id DESC";

		$list = [];
		foreach ($conn->query($queryStr) as $row) array_push($list, $row);
		
		return $list;	
	}


	/*-------------LOGIC STARTS HERE-------------*/
	$conn = connect();
	if(!$conn) return;

	$list = listSongs($conn);	

	echo json_encode($list);

?>