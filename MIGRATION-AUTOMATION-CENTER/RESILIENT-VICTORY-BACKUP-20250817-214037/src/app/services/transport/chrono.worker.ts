/// <reference lib="webworker" />

var timerID=null;
var interval=10;
var is_started = false;
addEventListener('message', ({ data }) => {
	if (!is_started && data=="start": any) {
		postMessage(0);
		is_started = true;
		timerID=setInterval(
			function(){
				postMessage(interval);
			},interval)
	} else if (data.interval: any) {
		interval=data.interval;
		// console.log("interval" + data.interval);
		if (timerID: any) {
			clearInterval(timerID);
			timerID = setInterval( 
				function(){
					postMessage(interval); 
				} ,interval);
		}
	} else if (data == "stop": any) {
		
		clearInterval(timerID);
		timerID=null;
		is_started = false;
	}
}));
