<?php

	$received = json_decode(file_get_contents('php://input'));
	$link = $received->link;
	$shell_cmd = './getChords -y='.$link.' -c -l -bars -a  ';
	// $shell_cmd = shell_exec('./getChords -y=https://www.youtube.com/watch?v=I0PjuPu78rQ -c -l -bars -a  2>&1');
	$result = shell_exec( $shell_cmd );



	$file = 'graph.txt';


if (file_exists($file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    // readfile($file);
    $chords = file_get_contents($file);
    // exit;
}

$chords = explode(' ', $chords);
$str = '';

for($i=0; $i<count($chords); $i++){
	$c = explode(";",$chords[$i]);

	for($j=0; $j<$c[1]; $j++) $str = $str."| ".$c[0]."  ";

	if($i!=0 && $i%4==0)$str =$str."\n";
}

echo $str;
?>