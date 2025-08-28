<?php 
// DEPRECCCCCCCCC
	header('Content-type: application/json');
	include_once(__DIR__ . '/Database.class.php');

	$received = json_decode(file_get_contents('php://input'));

	file_put_contents('../scores/'.$received->title.'.json', json_encode($received->parts));


  $title = $received->title;
  $artist = $received->artist;
  $author = $received->author;
  $style = $received->style;
  $nb_parts = $received->nb_parts;
  $parts = $received->parts;
  $id = $received->id;
  $yt_link = $received->youtube_link;
  $yt_id = $received->youtube_videoId;
  $yt_fp = $received->youtube_filePath;
  $yt_r = $received->youtube_regions;

  //checks for empty parts.
	if($parts == [] || $title == ""){
		echo "Parts or title empty ? abording save"; 
		return; 
	}

	$conn = connect();

	insertOrUpdate($conn, $title, $artist, $author ,$style, $parts, $id, $yt_link, $yt_id, $yt_fp,$yt_r);

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

	function insertOrUpdate($conn, $title, $artist, $author, $style, $parts,$id, $yt_link, $yt_id, $yt_fp,$yt_r){

		if($id == -1) $result = getScoreId($conn, $title, $artist, $author, $style);
		else $result = getScoreById($conn, $id);

		if (count($result) == 0) {
	    insertSong($conn, $title, $artist, $author, $style,$parts, $yt_link, $yt_id, $yt_fp,$yt_r);
			$song_id = getScoreId($conn, $title, $artist, $author, $style)[0];
			insertParts($conn, $song_id, $parts);
		} else {
	    // echo "\nScore already exists : updating\n";
			updateSong($conn, $title, $artist, $author, $style, $id, $yt_link, $yt_id, $yt_fp,$yt_r);
			updateParts($conn, $result[0], $parts);
		}

	}

	function getScoreId($conn, $title,$artist,$author,$style){

		$queryStr = "SELECT id FROM songs WHERE title='$title' AND artist='$artist' AND author='$author' AND style='$style'";

		$ids = [];
		foreach ($conn->query($queryStr) as $row)
			array_push($ids, $row['id']); 

		return $ids;
	}

	function getScoreById($conn, $id){

		$queryStr = "SELECT id FROM songs WHERE id='$id'";

		$ids = [];
		foreach ($conn->query($queryStr) as $row)
			array_push($ids, $row['id']); 

		return $ids;
	}

	function insertSong($conn, $title, $artist, $author, $style, $parts, $yt_link, $yt_id, $yt_fp,$yt_r){

		$nb_parts = count($parts);
		$queryStr = "INSERT INTO songs(title,artist,author,style,nb_parts, yt_link, yt_id, yt_filePath, yt_regions) VALUES('$title', '$artist', '$author', '$style', '$nb_parts', '$yt_link', '$yt_id', '$yt_fp','$yt_r')";

		$nb = $conn->exec($queryStr);
		if ( $nb ) {
	    // echo "\nNew record created ".$nb." successfully.\n";
			$id = getScoreId($conn, $title, $artist, $author, $style)[0];
			echo $id;

		} else {
	    echo "\nError: " . $queryStr . "\n" . $conn->error;
		}
	}

	function insertParts($conn, $song_id, $parts){
		// echo 'insertPart';

		for($i = 0; $i < count($parts); $i++){

			$part = $parts[$i];

			$statement = $conn->prepare("INSERT INTO parts(song_id, title, chords, analysis, number, abc) VALUES(:song_id, :title, :chords, :analysis, :number, :abc)");
			$statement->bindParam('song_id', $song_id, PDO::PARAM_INT);
			$statement->bindParam('title', $part->title, PDO::PARAM_STR);
			$statement->bindParam('chords', $part->chords, PDO::PARAM_STR);
			$statement->bindParam('analysis', $part->analysis, PDO::PARAM_STR);
			$statement->bindParam('number', $i, PDO::PARAM_INT);
			$statement->bindParam('abc', $part->abc, PDO::PARAM_STR);

			$statement = $statement->execute();
			
			if ( $statement ) {
		    // echo "New part created  successfully.\n";
		    $nb_parts = count($parts);
		    $queryStr = "UPDATE songs SET nb_parts = $nb_parts WHERE id=$song_id";
				$nb = $conn->exec($queryStr);
			} else {
		    echo "\nError: " . $statement . "\n" . $conn->error;
			}
		}

	}


	function updateParts($conn, $song_id, $parts){

		$queryStr = "DELETE FROM parts WHERE song_id='$song_id'";

		$nb = $conn->exec($queryStr);
		if ( $nb > 0) {
	    // echo "Deleted ".$nb." parts with song_id='$song_id'\n";
	    insertParts($conn, $song_id, $parts);

			echo $song_id;

		} else {
	    echo "\nError: " . $queryStr . "\n" . $conn->error;
		}
	}

	function updateSong($conn, $title, $artist, $author, $style, $id, $yt_link, $yt_id, $yt_fp, $yt_r){
		
		$statement = $conn->prepare("UPDATE songs SET title=:title WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('title', $title, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		$statement = $conn->prepare("UPDATE songs SET artist=:artist WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('artist', $artist, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		$statement = $conn->prepare("UPDATE songs SET author=:author WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('author', $author, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		$statement = $conn->prepare("UPDATE songs SET style=:style WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('style', $style, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();


		//------------------------
		$statement = $conn->prepare("UPDATE songs SET y_link=:yt_link WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('yt_link', $yt_link, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();


		//------------------------
		$statement = $conn->prepare("UPDATE songs SET y_id=:yt_id WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('yt_id', $yt_id, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();


		$statement = $conn->prepare("UPDATE songs SET y_filePath=:yt_filePath WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('yt_filePath', $yt_fp, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();

		$statement = $conn->prepare("UPDATE songs SET y_regions=:yt_regions WHERE id=:id");
		if ($statement === false) {
			echo 'erreur statement';
		  return;
		}
		$statement->bindParam('yt_regions', $yt_r, PDO::PARAM_STR);	
		$statement->bindParam('id', $id, PDO::PARAM_INT);	
		$statement = $statement->execute();
	}

?>
