//Copyright Tom Hoddes 2014 http://freetuner.co 
var audioContext = new AudioContext();
var inputStreamNode = null,
    gainNode = null;

function getMaxPeak(inputVector,numFreq)
{
    numFreq = typeof numFreq !== 'undefined' ? numFreq : 2000;
    var peaks = [];
    var peakMax = 0;
    var peakMaxInd = 0;
    var size = inputVector.length * 2;

    for(var i=7;i<numFreq;i++)
    {
        var amplitude = inputVector[i];
        if(amplitude>peakMax)
        {
            peakMax=amplitude;
            peakMaxInd=i;
        }
    }
    return {"peakInd":peakMaxInd,"peakAmp":peakMax};
}


var audioWindowSize = 65536;
var audioWindow = new Float32Array(audioWindowSize);
var audioWindowProcessed = new Float32Array(audioWindowSize);
var hammingWindowFilter = new Float32Array(audioWindowSize);
var sampleRate;
for (var i = 0; i < hammingWindowFilter.length; i++) {
    hammingWindowFilter[i] = 0.54 - 0.46 * Math.cos(2*Math.PI * i/(hammingWindowFilter.length-1));
};
var fft;

function applyHamming(inputVector, outputVector)
{
    for (var i = 0; i < inputVector.length; i++) {
        outputVector[i] = inputVector[i] * hammingWindowFilter[i];
    };
}

function log2(val) 
{
  return Math.log(val) / Math.LN2;
}

function getNoteInfo(frequency)
{
    var note = (Math.round(57+log2( frequency/440.0 )*12 ))%12;
    var noteFull = Math.round(log2( frequency/440.0 )*12);
    var noteFreq = Math.pow(2,noteFull/12.0)*440.0;
    var errorMin = frequency - noteFreq;
    var noteOther = (errorMin > 0) ? noteFull+1 : noteFull-1;
    var freqOther = Math.pow(2,noteOther/12.0)*440.0;
    var cent = errorMin / Math.abs(noteFreq - freqOther);
    
    var noteInfo = {
        "noteIndex": note,
        "noteError": cent,
        "noteFreq": frequency
    };

    return noteInfo;
}

function gotStream(stream) {
    var bufferSize = 2048;
    gainNode = audioContext.createGain();
    gainNode.gain.value = 1000.0;

    inputStreamNode = audioContext.createMediaStreamSource(stream);
    inputStreamNode.connect(gainNode);

    //TODO: use deprecated function in other versions?
    scriptProcessorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);

    sampleRate = audioContext.sampleRate;
    fft = new FFT(audioWindowSize, sampleRate);

    gainNode.connect (scriptProcessorNode);

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    scriptProcessorNode.connect( zeroGain );
    zeroGain.connect( audioContext.destination );

    play();
}

function stopAudio()
{
    scriptProcessorNode.onaudioprocess = null;
}

function startAudio()
{
    scriptProcessorNode.onaudioprocess = function(e){
        var timeVector = e.inputBuffer.getChannelData(0);
        audioWindow.set(audioWindow.subarray(timeVector.length));
        audioWindow.set(timeVector,audioWindowSize - timeVector.length);
        applyHamming(audioWindow,audioWindowProcessed);
        fft.forward(audioWindowProcessed);

        var spectrum = fft.spectrum;
        var peakInfo = getMaxPeak(spectrum);
        if (peakInfo["peakAmp"] > 0.5)
        {
            var frequency = peakInfo["peakInd"]*sampleRate/audioWindowSize;
            var noteInfo = getNoteInfo(frequency);
            updateTuner(noteInfo["noteIndex"],noteInfo["noteError"]);
        }

    }
}

function browserNotSupported()
{
    alert("Sorry. Your browser is not supported. Please use latest versions of either Chrome or Firefox.")
}

function initAudio() {
    if (!navigator.getUserMedia)
    {
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    }

    if (!navigator.getUserMedia)
    {
        browserNotSupported();
    }


    navigator.getUserMedia({audio:true}, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio );
