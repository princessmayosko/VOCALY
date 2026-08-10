console.log("PITCH ENGINE ÇALIŞTI - CETVEL BAĞLI");


let audioContext;
let analyser;
let microphone;
let dataArray;
let micStream;


let pitchRunning = false;


let smoothFrequency = 0;



// ==========================
// BAŞLAT
// ==========================


async function startPitch(){


    if(pitchRunning)
        return;


    pitchRunning=true;



    try{


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



        analyser.fftSize = 4096;



        dataArray =
        new Float32Array(
            analyser.fftSize
        );



        microphone.connect(analyser);



        detectPitch();



    }


    catch(e){

        console.error(
            "Mikrofon hatası",
            e
        );

    }


}







// ==========================
// PITCH OKUMA
// ==========================


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



        if(smoothFrequency===0){

            smoothFrequency=frequency;

        }

        else{

            smoothFrequency =
            smoothFrequency * 0.85 +
            frequency * 0.15;

        }




        let note =
        frequencyToNote(
            smoothFrequency
        );




        // CETVEL

        if(typeof updateCetvel==="function"){


            updateCetvel(note);


        }





        // SONUÇ

        let result =
        document.getElementById(
            "pitch-result"
        );



        if(result){

            result.innerHTML =
            note.toUpperCase();

        }



    }



    requestAnimationFrame(
        detectPitch
    );


}







// ==========================
// FREKANS NOTA
// ==========================


function frequencyToNote(freq){



    let midi =

    Math.round(

        69 +

        12 *

        Math.log2(freq/440)

    );



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



    return notes[

        ((midi%12)+12)%12

    ];

}







// ==========================
// AUTOCORRELATION
// ==========================


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



    // sessizlik

    if(rms < 0.015){

        return -1;

    }






    let bestOffset=-1;

    let bestCorrelation=0;





    for(
        let offset=20;
        offset<SIZE/2;
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

        (SIZE-offset);





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





    if(
        bestCorrelation > 0.25 &&
        bestOffset>0
    ){



        let frequency =

        sampleRate /

        bestOffset;




        if(
            frequency>60 &&
            frequency<1000
        ){


            return frequency;


        }


    }



    return -1;



}







// ==========================
// DURDUR
// ==========================


function stopPitch(){



    pitchRunning=false;


    smoothFrequency=0;



    if(micStream){


        micStream
        .getTracks()
        .forEach(
            t=>t.stop()
        );


    }



    if(audioContext){


        audioContext.close();


    }


}
