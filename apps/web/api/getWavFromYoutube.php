<?php

header('Content-type: application/json');
$received = json_decode(file_get_contents('php://input'));

$youtube_link 		= $received->link;
$file_name 		= $received->name;

	// $cmd = "LC_ALL=en_US.UTF-8 ./yt-dlp -x --audio-format mp3 -o '../shared/wavfiles/".$file_name.".%(ext)s' ".$youtube_link;
	$cmd = "./yt-dlp -x --audio-format mp3 -o '../shared/wavfiles/".$file_name.".%(ext)s' ".$youtube_link;
	// ." 2>&1 &" ;

error_log('GETTING VIDEO FROM YOUTUBE ==============> \n'.$cmd);
$check_file_exist = file_exists ('../shared/wavfiles/'.$file_name.'.mp3');

if(!$check_file_exist) {
	error_log('File: '.$file_name.'.mp3 doesnt exist : downloading it from Youtube');
	$out = shell_exec($cmd);
	error_log('out ===>  '.$out);
}else{
	error_log('File: '.$file_name.'.mp3 exist. Abort download.');
}
echo $file_name.'.mp3';

?>


