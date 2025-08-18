<?php

	$received = json_decode(file_get_contents('php://input'));
	$string = $received->string;
	$shell_cmd = "./getChords/harmtrace parse --grammar=jazz --chords='".$string."' 2>&1";
	// $shell_cmd = shell_exec('./getChords -y=https://www.youtube.com/watch?v=I0PjuPu78rQ -c -l -bars -a  2>&1');
	$result = shell_exec( $shell_cmd );




echo $result;
?>