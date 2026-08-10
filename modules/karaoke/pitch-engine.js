console.log("PITCH ENGINE ÇALIŞTI");
let audioContext;
let analyser;
let microphone;
let dataArray;

async function startPitch(){

    const stream = await navigator.mediaDevices.getUserMedia({
        audio:true
    });


    audioContext =
    new AudioContext();


    microphone =
    audioContext.createMediaStreamSource(stream);


    analyser =
    audioContext.createAnalyser();


    analyser.fftSize=2048;


    microphone.connect(analyser);


    dataArray =
    new Float32Array(
        analyser.fftSize
    );


    detectPitch();

}




function detectPitch(){


    analyser.getFloatTimeDomainData(dataArray);


    let frequency =
    autoCorrelate(
        dataArray,
        audioContext.sampleRate
    );


    if(frequency !== -1){

        let note =
        frequencyToNote(frequency);


        document.getElementById(
            "pitch-result"
        ).innerHTML=note;

    }



    requestAnimationFrame(
        detectPitch
    );

}





function frequencyToNote(freq){

    let notes=[
    "do",
    "do#",
    "re",
    "re#",
    "mi",
    "fa",
    "fa#",
    "sol",
    "sol#",
    "la",
    "la#",
    "si"
    ];


    let midi =
    Math.round(
        69+
        12*Math.log2(freq/440)
    );


    return notes[midi%12];

}




function autoCorrelate(buffer,sampleRate){

    let rms=0;


    for(let i=0;i<buffer.length;i++){

        rms+=buffer[i]*buffer[i];

    }


    rms=Math.sqrt(
        rms/buffer.length
    );


    if(rms<0.01)
        return -1;



    let r1=0;
    let r2=buffer.length-1;


    while(
        buffer[r1]===0
        &&
        r1<buffer.length/2
    )
        r1++;


    while(
        buffer[r2]===0
        &&
        r2>buffer.length/2
    )
        r2--;



    buffer =
    buffer.slice(r1,r2);



    let size=buffer.length;


    let bestOffset=-1;
    let bestCorrelation=0;


    for(let offset=0;offset<size;offset++){

        let correlation=0;


        for(let i=0;i<size-offset;i++){

            correlation+=
            buffer[i]*
            buffer[i+offset];

        }


        correlation/=
        size-offset;


        if(correlation>bestCorrelation){

            bestCorrelation=
            correlation;

            bestOffset=
            offset;

        }

    }



    if(bestCorrelation>0.01){

        return sampleRate/bestOffset;

    }


    return -1;

}
