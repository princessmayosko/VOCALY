
/* =========================================================
   VOCALY – FONOMİMİ MERDİVENİ
   Pitch + Nota Merdiveni + Coin + Loki/Maya
   ========================================================= */


/* ---------------------------------------------------------
   NOTALAR
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   DOM
--------------------------------------------------------- */

const cat = document.getElementById("cat");

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

const lifeElement =
    document.getElementById("lifeCount");

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


/* ---------------------------------------------------------
   OYUN DURUMU
--------------------------------------------------------- */

let currentStep = 0;

let coins = 0;
let score = 0;
let combo = 0;
let lives = 3;

let gameStarted = false;

let selectedCharacter = "loki";

let audioContext = null;
let analyser = null;
let microphone = null;
let animationFrame = null;

let stream = null;

let lastCorrectTime = 0;


/* ---------------------------------------------------------
   CURWEN / KODÁLY EL İŞARETLERİ

   Basit, özgün SVG çizimleri.
--------------------------------------------------------- */

function handSVG(note){

    const common = `
        stroke="white"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
    `;


    /* DO
       Kapalı yumruk
    */

    if(note === "DO" || note === "DO2"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M18 38
                C16 25 22 17 32 17
                C43 17 51 25 51 37
                L48 51
                C46 58 39 61 32 59
                L22 55
                C19 51 18 45 18 38
                Z"/>
            <path ${common}
                d="M25 29 C31 33 38 34 44 30"/>
        </svg>
        `;
    }


    /* RE
       Parmaklar birleşik, el yukarı eğimli
    */

    if(note === "RE"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M17 47
                C20 41 23 34 27 28
                L35 16
                C37 13 41 14 41 18
                L36 31
                L48 17
                C50 14 54 16 53 20
                L45 34
                L55 22
                C57 19 61 21 59 25
                L49 40
                C45 47 38 51 29 52
                Z"/>
        </svg>
        `;
    }


    /* MI
       Yatay açık el
    */

    if(note === "MI"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M12 35
                L58 35
                C60 35 61 38 59 40
                L51 46
                C45 50 37 51 30 48
                L13 42
                Z"/>
            <line ${common} x1="21" y1="34" x2="21" y2="43"/>
            <line ${common} x1="29" y1="34" x2="29" y2="46"/>
            <line ${common} x1="37" y1="34" x2="37" y2="47"/>
        </svg>
        `;
    }


    /* FA
       Başparmak aşağı
    */

    if(note === "FA"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M18 20
                C24 15 33 16 39 21
                L50 31
                C54 35 53 40 49 43
                L42 48
                L35 57
                C33 60 28 59 28 55
                L29 43
                L20 36
                C15 32 14 25 18 20
                Z"/>
            <path ${common}
                d="M39 22 L48 16"/>
        </svg>
        `;
    }


    /* SOL
       Avuç göğse dönük / parmaklar yukarı
    */

    if(note === "SOL"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M18 52
                C18 43 18 33 19 24
                C19 20 23 19 25 22
                L26 37
                L28 16
                C28 12 32 12 34 16
                L35 37
                L38 15
                C38 11 42 12 43 16
                L43 38
                L47 21
                C48 17 52 18 52 22
                L50 44
                C49 51 43 56 36 57
                L26 57
                Z"/>
        </svg>
        `;
    }


    /* LA
       Gevşek, avuç aşağı
    */

    if(note === "LA"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M14 31
                C21 24 30 23 38 26
                C47 29 54 35 56 42
                C57 47 53 51 48 50
                C40 49 35 44 30 41
                C25 38 20 38 15 40
                Z"/>
            <path ${common}
                d="M26 28 C32 34 39 37 48 38"/>
        </svg>
        `;
    }


    /* SI
       İşaret parmağı yukarı
    */

    if(note === "SI"){

        return `
        <svg viewBox="0 0 70 70">
            <path ${common}
                d="
                M20 50
                C18 43 20 37 25 34
                L35 28
                L35 13
                C35 9 40 9 41 13
                L41 34
                L48 28
                C51 26 54 29 52 32
                L45 42
                C40 49 31 53 20 50
                Z"/>
        </svg>
        `;
    }

    return "";
}


/* ---------------------------------------------------------
   İŞARETLERİ YERLEŞTİR
--------------------------------------------------------- */

document.querySelectorAll(".hand-sign").forEach(el => {

    const note = el.dataset.note;

    el.innerHTML = handSVG(note);

});


/* ---------------------------------------------------------
   HEDEF NOTA
--------------------------------------------------------- */

function setTarget(index){

    currentStep = index;

    const note = NOTES[index];

    targetNote.textContent =
        note.display;

    targetHand.innerHTML =
        handSVG(note.name);

    document.querySelectorAll(".coin")
        .forEach((coin,i)=>{

            coin.classList.remove("inactive");

            if(i !== index){
                coin.classList.add("inactive");
            }

        });

    pitchStatus.textContent =
        "SÖYLE";

    pitchStatus.className =
        "pitch-status";
}


/* ---------------------------------------------------------
   KEDİ
--------------------------------------------------------- */

function updateCat(){

    const steps =
        document.querySelectorAll(".step");

    const step =
        steps[currentStep];

    if(!step) return;

    const stepRect =
        step.getBoundingClientRect();

    const ladderRect =
        document
        .getElementById("ladder")
        .getBoundingClientRect();

    const x =
        stepRect.left -
        ladderRect.left +
        stepRect.width / 2 -
        35;

    const y =
        ladderRect.bottom -
        stepRect.bottom -
        stepRect.height -
        5;

    cat.style.left =
        `${x}px`;

    cat.style.bottom =
        `${y}px`;

}


/* ---------------------------------------------------------
   KARAKTER SEÇİMİ
--------------------------------------------------------- */

lokiBtn.onclick = () => {

    selectedCharacter = "loki";

    lokiBtn.classList.add("active");
    mayaBtn.classList.remove("active");

    cat.textContent = "🐱";
};


mayaBtn.onclick = () => {

    selectedCharacter = "maya";

    mayaBtn.classList.add("active");
    lokiBtn.classList.remove("active");

    cat.textContent = "🐈‍⬛";
};


/* ---------------------------------------------------------
   DOĞRU NOTA
--------------------------------------------------------- */

function correctNote(){

    const now = performance.now();

    if(now - lastCorrectTime < 900){
        return;
    }

    lastCorrectTime = now;

    const coin =
        document.querySelectorAll(".coin")[currentStep];

    if(coin){

        coin.classList.remove("inactive");
        coin.classList.add("collected");

        setTimeout(()=>{
            coin.classList.remove("collected");
        },500);
    }


    score += 100 + combo * 10;

    coins += 1;

    combo += 1;


    scoreElement.textContent =
        score;

    coinCount.textContent =
        coins;

    comboElement.textContent =
        combo;


    pitchStatus.textContent =
        "DOĞRU! ✓";

    pitchStatus.className =
        "pitch-status correct";


    cat.classList.remove("jump");

    void cat.offsetWidth;

    cat.classList.add("jump");


    if(currentStep < NOTES.length - 1){

        setTimeout(()=>{

            setTarget(currentStep + 1);

            updateCat();

        },500);

    }else{

        setTimeout(()=>{

            finishLevel();

        },600);

    }

}


/* ---------------------------------------------------------
   YANLIŞ NOTA
--------------------------------------------------------- */

function wrongPitch(){

    pitchStatus.textContent =
        "HEDEFE YAKLAŞ";

    pitchStatus.className =
        "pitch-status wrong";
}


/* ---------------------------------------------------------
   SEVİYE BİTİŞ
--------------------------------------------------------- */

function finishLevel(){

    pitchStatus.textContent =
        "🎉 TAMAMLANDI!";

    pitchStatus.className =
        "pitch-status correct";

    gameStarted = false;

    micBtn.disabled = true;

    document.getElementById("instruction")
        .innerHTML =
        "Harika! Do–Do' merdivenini tamamladın. 🎵";
}


/* ---------------------------------------------------------
   FREKANS → MIDI
--------------------------------------------------------- */

function frequencyToMidi(freq){

    return 69 +
        12 * Math.log2(freq / 440);
}


/* ---------------------------------------------------------
   EN YAKIN NOTA
--------------------------------------------------------- */

function getNearestNote(freq){

    let best = null;

    let smallest = Infinity;

    NOTES.forEach(note=>{

        const cents =
            1200 *
            Math.log2(freq / note.freq);

        const distance =
            Math.abs(cents);

        if(distance < smallest){

            smallest = distance;

            best = {
                note,
                cents
            };
        }

    });

    return best;
}


/* ---------------------------------------------------------
   PITCH ANALİZİ
--------------------------------------------------------- */

function detectPitch(){

    if(!analyser){
        return;
    }

    const buffer =
        new Float32Array(
            analyser.fftSize
        );

    analyser.getFloatTimeDomainData(buffer);


    let rms = 0;

    for(let i=0;i<buffer.length;i++){

        rms +=
            buffer[i] *
            buffer[i];

    }

    rms =
        Math.sqrt(
            rms / buffer.length
        );


    /* Çok düşük ses */

    if(rms < 0.008){

        pitchStatus.textContent =
            "SES BEKLENİYOR";

        requestAnimationFrame(detectPitch);

        return;
    }


    const frequency =
        autoCorrelate(
            buffer,
            audioContext.sampleRate
        );


    if(frequency === -1){

        requestAnimationFrame(detectPitch);

        return;
    }


    pitchHz.textContent =
        Math.round(frequency) + " Hz";


    const nearest =
        getNearestNote(frequency);


    if(!nearest){

        requestAnimationFrame(detectPitch);

        return;
    }


    /* Pitch göstergesi */

    const normalized =
        Math.max(
            -100,
            Math.min(
                100,
                nearest.cents
            )
        );

    const percent =
        50 + normalized / 2;

    pitchFill.style.bottom =
        `${percent}%`;


    /* ±35 cent tolerans */

    if(
        Math.abs(nearest.cents) <= 35 &&
        nearest.note.name === NOTES[currentStep].name
    ){

        correctNote();

    }else{

        wrongPitch();

    }


    requestAnimationFrame(detectPitch);
}


/* ---------------------------------------------------------
   AUTOCORRELATION
--------------------------------------------------------- */

function autoCorrelate(buffer, sampleRate){

    let SIZE =
        buffer.length;

    let rms = 0;

    for(let i=0;i<SIZE;i++){

        rms +=
            buffer[i] *
            buffer[i];

    }

    rms =
        Math.sqrt(
            rms / SIZE
        );

    if(rms < 0.01){
        return -1;
    }


    let r1 = 0;
    let r2 = SIZE - 1;

    const threshold = 0.2;


    for(let i=0;i<SIZE/2;i++){

        if(
            Math.abs(buffer[i])
            < threshold
        ){

            r1 = i;
            break;
        }
    }


    for(
        let i=1;
        i<SIZE/2;
        i++
    ){

        if(
            Math.abs(buffer[SIZE-i])
            < threshold
        ){

            r2 = SIZE-i;
            break;
        }
    }


    buffer =
        buffer.slice(r1,r2);

    SIZE =
        buffer.length;


    const correlations =
        new Array(SIZE).fill(0);


    for(
        let lag=0;
        lag<SIZE;
        lag++
    ){

        for(
            let i=0;
            i<SIZE-lag;
            i++
        ){

            correlations[lag] +=
                buffer[i] *
                buffer[i+lag];

        }

    }


    let d = 0;

    while(
        d < SIZE-1 &&
        correlations[d] >
        correlations[d+1]
    ){

        d++;

    }


    let maxval = -1;
    let maxpos = -1;

    for(
        let i=d;
        i<SIZE;
        i++
    ){

        if(
            correlations[i]
            > maxval
        ){

            maxval =
                correlations[i];

            maxpos =
                i;
        }

    }


    let T0 =
        maxpos;


    if(
        maxpos > 0 &&
        maxpos < SIZE-1
    ){

        const x1 =
            correlations[maxpos-1];

        const x2 =
            correlations[maxpos];

        const x3 =
            correlations[maxpos+1];

        const a =
            (x1+x3-2*x2)/2;

        const b =
            (x3-x1)/2;

        if(a){
            T0 =
                maxpos -
                b/(2*a);
        }

    }


    if(!T0){
        return -1;
    }


    return sampleRate / T0;
}


/* ---------------------------------------------------------
   MİKROFON
--------------------------------------------------------- */

async function startMicrophone(){

    try{

        stream =
            await navigator.mediaDevices
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
            audioContext.createAnalyser();

        analyser.fftSize =
            2048;

        analyser.smoothingTimeConstant =
            0.15;


        microphone =
            audioContext
            .createMediaStreamSource(
                stream
            );


        microphone.connect(
            analyser
        );


        micBtn.textContent =
            "🎤 MİKROFON AÇIK";

        micBtn.classList.add("active");


        detectPitch();

    }catch(error){

        console.error(error);

        alert(
            "Mikrofon açılamadı. Tarayıcı mikrofon iznini kontrol et."
        );

    }

}


/* ---------------------------------------------------------
   MİKROFONU DURDUR
--------------------------------------------------------- */

function stopMicrophone(){

    if(stream){

        stream
        .getTracks()
        .forEach(track=>{
            track.stop();
        });

        stream = null;
    }


    if(audioContext){

        audioContext.close();

        audioContext = null;
    }


    analyser = null;


    micBtn.textContent =
        "🎤 MİKROFONU BAŞLAT";

    micBtn.classList.remove("active");
}


/* ---------------------------------------------------------
   BUTONLAR
--------------------------------------------------------- */

micBtn.onclick = async ()=>{

    if(stream){

        stopMicrophone();

    }else{

        await startMicrophone();

    }

};


startBtn.onclick = async ()=>{

    resetGame();

    gameStarted = true;

    micBtn.disabled = false;

    await startMicrophone();

};


resetBtn.onclick = ()=>{

    resetGame();

};


/* ---------------------------------------------------------
   RESET
--------------------------------------------------------- */

function resetGame(){

    stopMicrophone();

    currentStep = 0;

    coins = 0;
    score = 0;
    combo = 0;
    lives = 3;

    gameStarted = false;

    scoreElement.textContent =
        "0";

    coinCount.textContent =
        "0";

    comboElement.textContent =
        "0";

    lifeElement.textContent =
        "3";

    setTarget(0);

    updateCat();

    pitchStatus.textContent =
        "HAZIR";

    pitchStatus.className =
        "pitch-status";

    pitchHz.textContent =
        "—";

    document.getElementById("instruction")
        .innerHTML =
        "Hedef notayı doğru söyle.<br>Kedi doğru basamağa zıplayıp coin'i alacak!";

}


/* ---------------------------------------------------------
   BAŞLANGIÇ
--------------------------------------------------------- */

window.addEventListener(
    "resize",
    updateCat
);

window.addEventListener(
    "load",
    ()=>{

        setTarget(0);

        updateCat();

    }
);
