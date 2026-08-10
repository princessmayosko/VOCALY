console.log("PITCH ENGINE YENİ SÜRÜM - HZ YOK");


let audioContext;
let analyser;
let microphone;
let dataArray;
let micStream;

let pitchRunning = false;



async function startPitch(){


    if(pitchRunning) return;


    pitchRunning = true;


    micStream =
    await navigator.mediaDevices.getUserMedia({
        audio:true
    });



    audioContext =
    new AudioContext();



    microphone =
    audioContext.createMediaStreamSource(
        micStream
    );



    analyser =
    audioContext.createAnalyser();


    analyser.fftSize = 2048;



    dataArray =
    new Float32Array(
        analyser.fftSize
    );



    microphone.connect(analyser);



    detectPitch();


}








function detectPitch(){


    if(!pitchRunning)
        return;



    analyser.getFloatTimeDomainData(
        dataArray
    );



    let frequency =
    autoCorrelate(
        dataArray,
        audioContext.sampleRate
    );



    if(frequency !== -1){



        let note =
        frequencyToNote(frequency);



        let result=false;



        if(typeof checkPitch==="function"){


            result =
            checkPitch(note);



            console.log(
                "Nota:",
                note,
                "Doğru:",
                result
            );


        }





        let element =
        document.getElementById(
            "pitch-result"
        );



        if(element){


            element.innerHTML =
            note


        }


    }




    requestAnimationFrame(
        detectPitch
    );


}









// FREKANS -> NOTA
// Oktav kaldırıldı

function frequencyToNote(freq){


    let midi =
    Math.round(
        69 +
        12 *
        Math.log2(freq / 440)
    );



    let notes = [

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



    return notes[
        ((midi % 12)+12)%12
    ];

}










// AUTOCORRELATION

function autoCorrelate(
    buffer,
    sampleRate
){



    let SIZE =
    buffer.length;



    let rms=0;



    for(let i=0;i<SIZE;i++){


        let val =
        buffer[i];


        rms += val*val;


    }



    rms =
    Math.sqrt(
        rms/SIZE
    );



    if(rms < 0.01){

        return -1;

    }






    let r1=0;
    let r2=SIZE-1;



    while(
        Math.abs(buffer[r1]) <0.02
        &&
        r1<SIZE/2
    ){

        r1++;

    }



    while(
        Math.abs(buffer[r2]) <0.02
        &&
        r2>SIZE/2
    ){

        r2--;

    }





    buffer =
    buffer.slice(
        r1,
        r2
    );



    SIZE =
    buffer.length;



    let bestOffset=-1;

    let bestCorrelation=0;





    for(
        let offset=20;
        offset<SIZE;
        offset++
    ){


        let correlation=0;



        for(
            let i=0;
            i<SIZE-offset;
            i++
        ){


            correlation +=
            buffer[i] *
            buffer[i+offset];


        }



        correlation /=
        SIZE-offset;




        if(
            correlation >
            bestCorrelation
        ){


            bestCorrelation =
            correlation;


            bestOffset =
            offset;


        }


    }





    if(bestCorrelation > 0.01){



        let frequency =
        sampleRate /
        bestOffset;



        if(
            frequency > 50 &&
            frequency < 1200
        ){


            return frequency;


        }


    }




    return -1;


}









function stopPitch(){



    pitchRunning=false;



    if(micStream){


        micStream
        .getTracks()
        .forEach(
            track=>track.stop()
        );


    }




    if(audioContext){


        audioContext.close();


    }


}
