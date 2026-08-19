/* =========================================================
   VOCALY – FONOMİMİ MERDİVENİ
   ========================================================= */


/* =========================================================
   NOTALAR
========================================================= */

const NOTES = [

    {
        name:"DO",
        display:"DO",
        freq:261.63
    },

    {
        name:"RE",
        display:"RE",
        freq:293.66
    },

    {
        name:"MI",
        display:"Mİ",
        freq:329.63
    },

    {
        name:"FA",
        display:"FA",
        freq:349.23
    },

    {
        name:"SOL",
        display:"SOL",
        freq:392.00
    },

    {
        name:"LA",
        display:"LA",
        freq:440.00
    },

    {
        name:"SI",
        display:"Sİ",
        freq:493.88
    },

    {
        name:"DO2",
        display:"DO'",
        freq:523.25
    }

];


/* =========================================================
   DOM
========================================================= */

const cat =
    document.getElementById("cat");

const ladder =
    document.getElementById("ladder");

const targetNote =
    document.getElementById("targetNote");

const targetHand =
    document.getElementById("targetHand");

const pitchFill =
    document.getElementById("pitchFill");

const pitchStatus =
    document.getElementById("pitchStatus");

const pitchHz =
    document.getElementById("pitchHz");

const coinCount =
    document.getElementById("coinCount");

const scoreElement =
    document.getElementById("score");

const comboElement =
    document.getElementById("combo");

const micBtn =
    document.getElementById("micBtn");

const startBtn =
    document.getElementById("startBtn");

const resetBtn =
    document.getElementById("resetBtn");

const lokiBtn =
    document.getElementById("lokiBtn");

const mayaBtn =
    document.getElementById("mayaBtn");


/* =========================================================
   OYUN DURUMU
========================================================= */

let currentStep = 0;

let direction = 1;

let coins = 0;

let score = 0;

let combo = 0;

let gameStarted = false;

let selectedCharacter = "loki";

let stream = null;

let audioContext = null;

let analyser = null;

let microphone = null;

let pitchAnimation = null;

let correctSince = 0;

let lastMoveTime = 0;


/*
   Öğrenci hedef sesi bu süre boyunca
   doğru söylemeli.
*/

const REQUIRED_HOLD_MS = 300;


/*
   Pitch toleransı.
*/

const CENT_TOLERANCE = 35;


/* =========================================================
   FONOMİMİ İŞARETLERİ
========================================================= */

function handSVG(note){

    const common = `
        stroke="white"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
    `;


    /*
       DO
       Kapalı yumruk
    */

    if(note === "DO" || note === "DO2"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M22 24
                C18 30 18 44 22 50
                C26 57 38 60 47 56
                C54 53 56 44 53 36
                L50 26
                C48 21 43 19 39 22
                L34 26
                L30 21
                C27 18 24 20 22 24
                Z"
            />

            <path ${common}
                d="M29 27
                   C35 32 43 33 49 29"
            />

        </svg>
        `;
    }


    /*
       RE
       Düz el, yukarı eğimli
    */

    if(note === "RE"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M15 50
                L24 31
                L35 14
                C37 11 42 13 40 17
                L34 31
                L46 17
                C49 14 53 17 51 20
                L42 34
                L54 22
                C57 19 61 22 58 26
                L47 42
                C41 50 31 53 20 53
                Z"
            />

        </svg>
        `;
    }


    /*
       MI
       Yatay düz el
    */

    if(note === "MI"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M10 36
                C20 31 35 31 58 34
                L59 41
                C45 44 29 45 12 42
                Z"
            />

            <line ${common}
                x1="23"
                y1="34"
                x2="23"
                y2="42"
            />

            <line ${common}
                x1="31"
                y1="33"
                x2="31"
                y2="43"
            />

            <line ${common}
                x1="39"
                y1="33"
                x2="39"
                y2="43"
            />

        </svg>
        `;
    }


    /*
       FA
       Başparmak aşağı
    */

    if(note === "FA"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M18 23
                C24 18 35 19 41 25
                L52 35
                C55 38 54 42 50 45
                L42 49
                L35 58
                C32 61 28 59 29 55
                L31 44
                L20 37
                C15 33 14 27 18 23
                Z"
            />

            <path ${common}
                d="
                M40 25
                L48 17"
            />

        </svg>
        `;
    }


    /*
       SOL
       Açık el / avuç içi
    */

    if(note === "SOL"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M18 52
                L18 26
                C18 22 22 21 24 25
                L26 39
                L28 17
                C28 13 32 13 34 17
                L35 39
                L38 17
                C38 13 42 13 43 17
                L43 39
                L47 22
                C48 18 52 19 52 23
                L50 44
                C49 51 43 55 36 57
                L25 57
                Z"
            />

        </svg>
        `;
    }


    /*
       LA
       Gevşek kavisli el
    */

    if(note === "LA"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M13 34
                C21 26 30 24 39 27
                C48 30 55 35 57 41
                C59 46 55 51 50 50
                C41 49 35 44 29 41
                C24 39 19 40 14 42
                Z"
            />

        </svg>
        `;
    }


    /*
       SI
       İşaret parmağı yukarı
    */

    if(note === "SI"){

        return `
        <svg viewBox="0 0 70 70">

            <path ${common}
                d="
                M19 51
                C17 45 20 38 26 34
                L34 29
                L34 13
                C34 9 40 9 41 13
                L41 35
                L48 29
                C51 26 55 29 52 33
                L45 43
                C40 50 30 54 19 51
                Z"
            />

        </svg>
        `;
    }

    return "";
}


/* =========================================================
   İŞARETLERİ YERLEŞTİR
========================================================= */

document
    .querySelectorAll(".hand-sign")
    .forEach(el => {

        el.innerHTML =
            handSVG(el.dataset.note);

    });


/* =========================================================
   HEDEF NOTA
========================================================= */

function setTarget(index){

    currentStep = index;

    const note =
        NOTES[index];

    targetNote.textContent =
        note.display;

    targetHand.innerHTML =
        handSVG(note.name);


    /*
       Coinleri pasifleştir.
    */

    document
        .querySelectorAll(".coin")
        .forEach((coin,i)=>{

            coin.classList.toggle(
                "inactive",
                i !== index
            );

        });


    /*
       Hedef basamağı vurgula.
    */

    document
        .querySelectorAll(".step")
        .forEach((step,i)=>{

            step.classList.toggle(
                "active-target",
                i === index
            );

        });


    pitchStatus.textContent =
        `SÖYLE: ${note.display}`;

    pitchStatus.className =
        "pitch-status";

    correctSince = 0;
}


/* =========================================================
   KEDİ POZİSYONU
========================================================= */

function positionCatAtStart(){

    cat.style.left =
        "-88px";

    cat.style.bottom =
        "0px";

}


/* =========================================================
   KEDİYİ BASAMAĞA KOY
========================================================= */

function positionCatOnStep(index){

    const step =
        document.querySelector(
            `.step[data-index="${index}"]`
        );

    if(!step){
        return;
    }


    /*
       Basamak koordinatlarını
       doğrudan CSS'ten alıyoruz.
    */

    const stepLeft =
        step.offsetLeft;

    const stepBottom =
        parseFloat(
            getComputedStyle(step)
            .bottom
        );


    const x =
        stepLeft +
        step.offsetWidth / 2 -
        35;


    /*
       Kedi basamağın üstünde.
    */

    const y =
        stepBottom +
        step.offsetHeight -
        5;


    cat.style.left =
        `${x}px`;

    cat.style.bottom =
        `${y}px`;

}


/* =========================================================
   KEDİ HAREKETİ
========================================================= */

function moveCatToStep(index){

    const now =
        performance.now();

    if(now - lastMoveTime < 650){
        return;
    }

    lastMoveTime = now;


    positionCatOnStep(index);


    cat.classList.remove("jump");

    void cat.offsetWidth;

    cat.classList.add("jump");


    setTimeout(()=>{

        cat.classList.remove("jump");

    },600);

}


/* =========================================================
   KARAKTER SEÇİMİ
========================================================= */

lokiBtn.addEventListener(
    "click",
    ()=>{

        selectedCharacter =
            "loki";

        lokiBtn.classList.add("active");

        mayaBtn.classList.remove("active");

        cat.classList.remove("maya");

        cat.classList.add("loki");

    }
);


mayaBtn.addEventListener(
    "click",
    ()=>{

        selectedCharacter =
            "maya";

        mayaBtn.classList.add("active");

        lokiBtn.classList.remove("active");

        cat.classList.remove("loki");

        cat.classList.add("maya");

    }
);


/* =========================================================
   REFERANS SES
========================================================= */

let referenceAudioContext = null;


function playReferenceNote(index){

    const note =
        NOTES[index];

    if(!referenceAudioContext){

        referenceAudioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if(
        referenceAudioContext.state ===
        "suspended"
    ){

        referenceAudioContext.resume();

    }


    const ctx =
        referenceAudioContext;

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type =
        "sine";

    oscillator.frequency.value =
        note.freq;


    gain.gain.setValueAtTime(
        0.0001,
        ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.20,
        ctx.currentTime + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.9
    );


    oscillator.connect(gain);

    gain.connect(ctx.destination);


    oscillator.start();

    oscillator.stop(
        ctx.currentTime + 0.95
    );


    /*
       Basamağı kısa süre vurgula.
    */

    const step =
        document.querySelector(
            `.step[data-index="${index}"]`
        );

    if(step){

        step.classList.add(
            "active-target"
        );

        setTimeout(()=>{

            if(index !== currentStep){

                step.classList.remove(
                    "active-target"
                );

            }

        },700);

    }

}


/* =========================================================
   BASAMAKLARA TIKLAMA
========================================================= */

document
    .querySelectorAll(".step")
    .forEach(step => {

        step.addEventListener(
            "click",
            event => {

                /*
                   Coin'e tıklanmışsa
                   ikinci kez çalıştırma.
                */

                if(
                    event.target.closest(".coin")
                ){
                    return;
                }


                const index =
                    Number(
                        step.dataset.index
                    );

                playReferenceNote(index);

            }
        );

    });


/*
   Coin'e tıklayınca da referans sesi.
*/

document
    .querySelectorAll(".coin")
    .forEach(coin => {

        coin.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const index =
                    Number(
                        coin.dataset.index
                    );

                playReferenceNote(index);

            }
        );

    });


/* =========================================================
   PITCH – FREKANS OKUMA
========================================================= */

function autoCorrelate(
    buffer,
    sampleRate
){

    const size =
        buffer.length;


    let rms = 0;

    for(let i=0;i<size;i++){

        rms +=
            buffer[i] *
            buffer[i];

    }

    rms =
        Math.sqrt(
            rms / size
        );


    /*
       Sessizlik.
    */

    if(rms < 0.008){

        return -1;

    }


    /*
       Aradığımız insan sesi aralığı.
       80–900 Hz.
    */

    const minFreq = 80;

    const maxFreq = 900;

    const minLag =
        Math.floor(
            sampleRate / maxFreq
        );

    const maxLag =
        Math.floor(
            sampleRate / minFreq
        );


    let bestLag = -1;

    let bestCorrelation = 0;


    /*
       Ortalama çıkar.
    */

    let mean = 0;

    for(let i=0;i<size;i++){

        mean += buffer[i];

    }

    mean /= size;


    /*
       Normalize edilmiş
       autocorrelation.
    */

    for(
        let lag=minLag;
        lag<=maxLag;
        lag++
    ){

        let sum = 0;

        let energyA = 0;

        let energyB = 0;


        for(
            let i=0;
            i<size-lag;
            i++
        ){

            const a =
                buffer[i] - mean;

            const b =
                buffer[i+lag] - mean;


            sum += a*b;

            energyA += a*a;

            energyB += b*b;

        }


        if(
            energyA === 0 ||
            energyB === 0
        ){

            continue;

        }


        const correlation =
            sum /
            Math.sqrt(
                energyA * energyB
            );


        if(
            correlation >
            bestCorrelation
        ){

            bestCorrelation =
                correlation;

            bestLag =
                lag;

        }

    }


    /*
       Zayıf pitch.
    */

    if(
        bestLag === -1 ||
        bestCorrelation < 0.55
    ){

        return -1;

    }


    return sampleRate / bestLag;

}


/* =========================================================
   CENT HESABI
========================================================= */

function centsFromFrequency(
    frequency,
    targetFrequency
){

    return 1200 *
        Math.log2(
            frequency /
            targetFrequency
        );

}


/* =========================================================
   PITCH GÖSTERGESİ
========================================================= */

function updatePitchMeter(cents){

    const limited =
        Math.max(
            -100,
            Math.min(
                100,
                cents
            )
        );


    const percent =
        50 +
        limited / 2;


    pitchFill.style.bottom =
        `${percent}%`;

}


/* =========================================================
   DOĞRU NOTA KONTROLÜ
========================================================= */

function processPitch(
    frequency
){

    if(!gameStarted){
        return;
    }


    const target =
        NOTES[currentStep];


    const cents =
        centsFromFrequency(
            frequency,
            target.freq
        );


    updatePitchMeter(cents);


    pitchHz.textContent =
        `${Math.round(frequency)} Hz`;


    /*
       Doğru nota.
    */

    if(
        Math.abs(cents) <=
        CENT_TOLERANCE
    ){

        pitchStatus.textContent =
            `✓ ${target.display}`;

        pitchStatus.className =
            "pitch-status correct";


        if(!correctSince){

            correctSince =
                performance.now();

        }


        /*
           300 ms doğru tutuldu.
        */

        if(
            performance.now() -
            correctSince >=
            REQUIRED_HOLD_MS
        ){

            collectCurrentCoin();

        }

    }else{

        correctSince = 0;


        if(cents > 0){

            pitchStatus.textContent =
                "Biraz pes söyle";

        }else{

            pitchStatus.textContent =
                "Biraz tiz söyle";

        }

        pitchStatus.className =
            "pitch-status wrong";

    }

}


/* =========================================================
   PITCH DÖNGÜSÜ
========================================================= */

function detectPitch(){

    if(
        !analyser ||
        !audioContext
    ){

        return;

    }


    const buffer =
        new Float32Array(
            analyser.fftSize
        );


    analyser.getFloatTimeDomainData(
        buffer
    );


    let rms = 0;

    for(
        let i=0;
        i<buffer.length;
        i++
    ){

        rms +=
            buffer[i] *
            buffer[i];

    }


    rms =
        Math.sqrt(
            rms /
            buffer.length
        );


    if(rms < 0.008){

        pitchStatus.textContent =
            "SES BEKLENİYOR";

        pitchStatus.className =
            "pitch-status";

        correctSince = 0;

        pitchAnimation =
            requestAnimationFrame(
                detectPitch
            );

        return;

    }


    const frequency =
        autoCorrelate(
            buffer,
            audioContext.sampleRate
        );


    if(
        frequency === -1
    ){

        pitchStatus.textContent =
            "PERDE ARANIYOR";

        correctSince = 0;

        pitchAnimation =
            requestAnimationFrame(
                detectPitch
            );

        return;

    }


    processPitch(
        frequency
    );


    pitchAnimation =
        requestAnimationFrame(
            detectPitch
        );

}


/* =========================================================
   COIN TOPLAMA
========================================================= */

function collectCurrentCoin(){

    if(!gameStarted){
        return;
    }


    /*
       Aynı notayı iki kez
       toplamasını engelle.
    */

    if(
        performance.now() -
        lastMoveTime <
        650
    ){

        return;

    }


    const coin =
        document.querySelector(
            `.coin[data-index="${currentStep}"]`
        );


    if(!coin){
        return;
    }


    /*
       Coin zaten alınmışsa çık.
    */

    if(
        coin.classList.contains(
            "collected"
        )
    ){

        return;

    }


    coin.classList.add(
        "collected"
    );


    coins++;

    combo++;

    score +=
        100 +
        combo * 10;


    coinCount.textContent =
        coins;

    scoreElement.textContent =
        score;

    comboElement.textContent =
        combo;


    moveCatToStep(
        currentStep
    );


    /*
       Yeni hedefe geç.
    */

    setTimeout(()=>{

        advanceTarget();

    },650);

}


/* =========================================================
   SONRAKİ HEDEF
========================================================= */

function advanceTarget(){

    correctSince = 0;


    /*
       Yukarı çıkış.
    */

    if(direction === 1){

        if(
            currentStep <
            NOTES.length - 1
        ){

            setTarget(
                currentStep + 1
            );

            return;

        }


        /*
           Üst Do'ya ulaştık.
           Şimdi aşağı.
        */

        direction = -1;


        setTarget(
            currentStep - 1
        );

        return;

    }


    /*
       Aşağı iniş.
    */

    if(direction === -1){

        if(
            currentStep > 0
        ){

            setTarget(
                currentStep - 1
            );

            return;

        }


        finishGame();

    }

}


/* =========================================================
   OYUN BİTİŞ
========================================================= */

function finishGame(){

    gameStarted = false;

    stopMicrophone();


    pitchStatus.textContent =
        "🎉 TAMAMLANDI!";

    pitchStatus.className =
        "pitch-status correct";


    document.getElementById(
        "instruction"
    ).textContent =
        "Harika! Merdiveni tamamladın.";

}


/* =========================================================
   MİKROFON
========================================================= */

async function startMicrophone(){

    try{

        stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio:{
                    echoCancellation:true,
                    noiseSuppression:true,
                    autoGainControl:false
                }

            });


        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        analyser =
            audioContext
            .createAnalyser();


        /*
           Pitch için yeterli çözünürlük.
        */

        analyser.fftSize =
            4096;


        analyser.smoothingTimeConstant =
            0.05;


        microphone =
            audioContext
            .createMediaStreamSource(
                stream
            );


        microphone.connect(
            analyser
        );


        micBtn.textContent =
            "🎤 Mikrofon Açık";

        micBtn.classList.add(
            "active"
        );


        detectPitch();


    }catch(error){

        console.error(
            "Mikrofon hatası:",
            error
        );


        alert(
            "Mikrofon açılamadı. Tarayıcı mikrofon iznini kontrol et."
        );

    }

}


/* =========================================================
   MİKROFONU DURDUR
========================================================= */

function stopMicrophone(){

    if(
        pitchAnimation
    ){

        cancelAnimationFrame(
            pitchAnimation
        );

        pitchAnimation =
            null;

    }


    if(stream){

        stream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        stream = null;

    }


    if(audioContext){

        audioContext
            .close()
            .catch(()=>{});

        audioContext =
            null;

    }


    analyser =
        null;

    microphone =
        null;


    micBtn.textContent =
        "🎤 Mikrofon";

    micBtn.classList.remove(
        "active"
    );

}


/* =========================================================
   BAŞLAT
========================================================= */

startBtn.addEventListener(
    "click",
    async ()=>{

        resetGame();

        gameStarted = true;

        startBtn.disabled = true;


        await startMicrophone();

    }
);


/* =========================================================
   MİKROFON BUTONU
========================================================= */

micBtn.addEventListener(
    "click",
    async ()=>{

        if(stream){

            stopMicrophone();

            return;

        }


        await startMicrophone();

    }
);


/* =========================================================
   RESET
========================================================= */

function resetGame(){

    stopMicrophone();


    currentStep = 0;

    direction = 1;

    coins = 0;

    score = 0;

    combo = 0;

    gameStarted = false;

    correctSince = 0;

    lastMoveTime = 0;


    /*
       Coinleri sıfırla.
    */

    document
        .querySelectorAll(".coin")
        .forEach(coin=>{

            coin.classList.remove(
                "collected"
            );

        });


    coinCount.textContent =
        "0";

    scoreElement.textContent =
        "0";

    comboElement.textContent =
        "0";


    startBtn.disabled =
        false;


    /*
       Kedi start point'e dönsün.
    */

    positionCatAtStart();


    setTarget(0);


    pitchStatus.textContent =
        "HAZIR";

    pitchStatus.className =
        "pitch-status";

    pitchHz.textContent =
        "—";


    pitchFill.style.bottom =
        "50%";


    document.getElementById(
        "instruction"
    ).textContent =
        "Do sesini söyle.";

}


/* =========================================================
   BAŞLANGIÇ
========================================================= */

window.addEventListener(
    "load",
    ()=>{

        /*
           İlk hedef Do.
        */

        setTarget(0);


        /*
           Kedi başlangıç noktasında.
        */

        positionCatAtStart();


        /*
           Loki başlangıçta.
        */

        cat.classList.add(
            "loki"
        );

    }
);


window.addEventListener(
    "resize",
    ()=>{

        /*
           Responsive durumda
           mevcut basamağı yeniden hesapla.
        */

        if(
            gameStarted &&
            currentStep > 0
        ){

            positionCatOnStep(
                currentStep
            );

        }

    }
);
