/// <reference lib="webworker" />

var timerID=null;
var interval=10;
var is_started = false;

addEventListener('message', ({ data }) => {
	if (!is_started && data=="start") {
		postMessage(0);

		is_started = true;
		timerID=setInterval(
			function(){
				postMessage(interval);
			},interval)


	} else if (data.interval) {

		interval=data.interval;
		// console.log("interval" + data.interval);

		if (timerID) {
			clearInterval(timerID);
			timerID = setInterval( 
				function(){
					postMessage(interval); 
				} ,interval);
		}
	} else if (data == "stop"){
		
		clearInterval(timerID);
		timerID=null;
		is_started = false;
	}

});

