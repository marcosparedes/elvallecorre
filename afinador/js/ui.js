//Copyright Tom Hoddes 2014 http://freetuner.co 
var numTicks = 10;
var dialDegrees = 45;
window.addEventListener('load', function(){
	var $tunerViewContainer = $("#tunerView");
	for (var i = 1; i <= numTicks; i++) {
		var $div = $("<div>", {id: "tick_"+i});
		$tunerViewContainer.append($div);
		var $div = $("<div>", {id: "tick_"+(-1)*i});
		$tunerViewContainer.append($div);
	};
});	

var timerInterval;

function play()
{
	var div = document.getElementById("playPause");
	div.className = "pause";
	startAudio();
	startClock();
}


function pause()
{
	var div = document.getElementById("playPause");
	div.className = "play";
	stopAudio();

	var message = $("#message");
	message.text("Paused: Click Play to continue");
	clearInterval(timerInterval);
}
function playPause(div)
{
	if(div.className == "pause")
	{
		pause();
	}
	else if(div.className == "play")
	{
		play();
	}
}

function startClock()
{
	var timeoutLengthSeconds = 5*60;
	var start = new Date;
	updateClock(timeoutLengthSeconds);
    timerInterval = setInterval(function() {
        var secondsPassed = (new Date - start)/1000;
        if(secondsPassed < timeoutLengthSeconds)
        {
        	updateClock(timeoutLengthSeconds-secondsPassed);
        }
        else
        {
        	pause();
        }
    }, 1000);
}

function updateClock(timeoutLengthSeconds)
{
	function formatNumberLength(num, length) {
	    var r = "" + num;
	    while (r.length < length) {
	        r = "0" + r;
	    }
	    return r;
	}
	var minutes = Math.floor(timeoutLengthSeconds / 60);
	var seconds = Math.floor(timeoutLengthSeconds%60);
	var clock = $("#message").text("Timeout: "+formatNumberLength(minutes,2)+":"+formatNumberLength(seconds,2));
}

function updateTuner(noteIndex, noteError) 
{
	//TODO: Assert params
	if(!(noteIndex && noteError) || !(noteIndex > 0 && noteIndex <12) || !(noteError > -50 && noteError < 50))
		return;

	var sharpHtml = '<sup class="sharp">#</sup>';
	var notes = ['C','C'+sharpHtml,'D','D'+sharpHtml,'E','F','F'+sharpHtml,'G','G'+sharpHtml,'A','A'+sharpHtml,'B'];
	var needle = document.getElementById("needle2");

	var degrees = noteError*2.0*dialDegrees;
	needle.style.webkitTransform = 'rotate('+degrees+'deg)';
	needle.style.MozTransform = 'rotate('+degrees+'deg)';

	var noteView = document.getElementById("noteView");
	noteView.innerHTML = notes[noteIndex];

	var body = document.getElementsByTagName("body")[0];

	if (Math.abs(noteError) < 0.05)
	{
		var tip = document.getElementById("tip");
		var tick = document.getElementById("tick_0");
		tip.className = "tipHighlighted";
		tick.style.backgroundColor = '#ffffff';
	}
	else
	{
		var tip = document.getElementById("tip");
		var tick = document.getElementById("tick_0");
		tip.className = "tipNormal";
		tick.style.backgroundColor = '';
	}
	
}