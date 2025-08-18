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

	function searchSongs($conn,$pattrnTitle,$pattrnArtist,$pattrnAlbum,$pattrnStyle,$pattrnAuthor,$pattrnKey,$pattrnChords){

		$queryStr = "SELECT * FROM `songs` WHERE `title` REGEXP '($pattrnTitle)' ";

        if($pattrnArtist && !empty($pattrnArtist)){
            $queryStr .= " AND `artist` REGEXP '($pattrnArtist)'";
        }
        if($pattrnAlbum && !empty($pattrnAlbum)){
            $queryStr .= " AND `album` REGEXP '($pattrnAlbum)'";
        }
        if($pattrnStyle && !empty($pattrnStyle)){
            $queryStr .= " AND `style` REGEXP '($pattrnStyle)'";
        }
        if($pattrnAuthor && !empty($pattrnAuthor)){
            $queryStr .= " AND `author` REGEXP '($pattrnAuthor)'";
        }
        if($pattrnKey && !empty($pattrnKey)){
            $queryStr .= " AND `tonality` REGEXP '($pattrnKey)'";
        }

        if($pattrnChords && !empty($pattrnChords)){
			$ids = searchChords($pattrnChords);
			if($ids != "")
            	$queryStr .= " AND `id` IN ($ids)";
            else
            	$queryStr .= " AND `id` IS NULL";
        }
        
		$queryStr .= " ORDER BY `title` ASC;";

        // echo("QUERY---------->".$queryStr);
		$matches = [];	
		foreach ($conn->query($queryStr) as $song) array_push($matches, $song);
		// $matches = $conn->query($queryStr);
		return $matches;	
	}


	// searching in files contained in scores folder for specific chords.
	// Chords are split with space and chain-searched with grep.
	function searchChords($pattern){
		
		$chords = explode(" ", $pattern);
		error_log("               ");
		error_log(json_encode($chords));
		
		$i=0;
		$cmd = "grep -Flw -m 1 ../shared/scores/public/*.chords.json -e '\"".$chords[0]."\":' ";
		foreach ($chords as $key => $chord) {
			$i+=1;
			if($i == 1 || $chord == "")continue;
			$cmd = $cmd."| xargs grep -wlF -m 1 '\"".$chord."\":' ";
		}
			
		$out = shell_exec($cmd);

		error_log($cmd);			
		$out = "'".$out;
		$out = str_replace("\n","','",$out);
		$out = substr($out, 0, -2);



		$out = str_replace("../shared/scores/public/","",$out);
		$out = str_replace(".chords.json","",$out);
		$out = str_replace("\"", "",$out);
		error_log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
		error_log($out);
		error_log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
		

		return $out;
	}

	// function searchParts($conn,$pattrn,$type){

	// 	// this pattern for chords =>   
	// 	// ("[^"]*\/{0,1}Bb")\s*(?:"_[VIvi][^|"]*"){0,1}[^|"]*[|]{0,1}[^|"]*("[^"]*\/{0,1}Cm")\s*(?:"_[VIvi][^|"]*"){0,1}[^|"]*[|]{0,1}[^|"]*("[^"]*\/{0,1}B")

	// 	// this pattern is for analysis	
	// 	// ("_I")[^|"]* [|]{0,1} \s* ("[A-G][^|"]*"){0,1} [^|"]* ("_V")

	// 	$chords = explode(" ", $pattrn);
	// 	if(sizeOf($chords) == 0)return [];

	// 	if($type == 'chords'){

	// 		$regPart2 = '\s*("_[VIvi][^|"]*"){0,1}[^|"]*[|]{0,1}[^|"]*';

	// 	}else if($type == 'analysis'){

	// 		$regPart2 = '[^|"]*[|]{0,1}\s*("[ABCDEFG][^"]*"){0,1}[^|]*';
	// 	}

	// 	if($type == 'chords'){

	// 		$regex = '("[^"]*/{0,1}' .$chords[0].'")';

	// 	}else if($type == 'analysis'){

	// 		$regex = '("_'.$chords[0].'")';
	// 	}
		
	// 	for($i = 1; $i < sizeOf($chords); $i++){

	// 		$regex = $regex . $regPart2;

	// 		if($type == 'chords')
	// 			$regex = $regex . '("[^"]*/{0,1}' .$chords[$i]. '[^"]*")';
	// 		else if($type == 'analysis')
	// 			$regex = $regex . '("_'.$chords[$i].'")';
	// 	}

	// 	// echo $regex;

	// 	$queryStr = "SELECT * FROM parts WHERE abc REGEXP '$regex'";
	// 	$matches = [];	

	// 	foreach ($conn->query($queryStr) as $part){

	// 		$sg_id = $part['song_id'];

	// 		$queryStr2 = "SELECT * FROM songs WHERE id='$sg_id'";
	// 		foreach ($conn->query($queryStr2) as $match){
	// 			$match['part_title'] = $part['title'];
	// 			unset($match['nb_parts']);
	// 			array_push($matches, $match);
	// 		}
	// 	}
		
	// 	return $matches;	
	// }

	
	/*-------------LOGIC STARTS HERE-------------*/
	$conn = connect();
	if(!$conn) return;

	$pattrnTitle = $received->pattrnTitle;
	$pattrnArtist = $received->pattrnArtist;
	$pattrnAlbum = $received->pattrnAlbum;
	$pattrnStyle = $received->pattrnStyle;
	$pattrnAuthor = $received->pattrnAuthor;
	$pattrnKey = $received->pattrnKey;
	$pattrnChords = $received->pattrnChords;

	$match = [];
	$match = searchSongs($conn,$pattrnTitle,$pattrnArtist,$pattrnAlbum,$pattrnStyle,$pattrnAuthor,$pattrnKey,$pattrnChords);

	echo json_encode($match);
?>