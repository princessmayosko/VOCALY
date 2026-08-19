/* =========================================================
   VOCALY – FONOMİMİ MERDİVENİ
   PITCH + KARAKTER + COIN SİSTEMİ
========================================================= */


/* =========================================================
   NOTALAR
========================================================= */

const NOTES = [
    {
        name: "DO",
        display: "DO",
        freq: 261.63
    },
    {
        name: "RE",
        display: "RE",
        freq: 293.66
    },
    {
        name: "MI",
        display: "Mİ",
        freq: 329.63
    },
    {
        name: "FA",
        display: "FA",
        freq: 349.23
    },
    {
        name: "SOL",
        display: "SOL",
        freq: 392.00
    },
    {
        name: "LA",
        display: "LA",
        freq: 440.00
    },
    {
        name: "SI",
        display: "Sİ",
        freq: 493.88
    },
    {
        name: "DO2",
        display: "DO'",
        freq: 523.25
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

let lastPitchProcessTime = 0;


/* =========================================================
   AYARLAR
========================================================= */

const REQUIRED_HOLD_MS = 300;

const CENT_TOLERANCE = 35;

/*
   Pitch işlemini her frame değil,
   yaklaşık 50 ms'de bir yapıyoruz.
*/
const PITCH_INTERVAL_MS = 50;


/* =========================================================
   FONOMİMİ İŞARETLERİ
========================================================= */

/*
   Özel SVG çizimleri yerine
   doğrudan emoji / Unicode el sembolleri.

   Bunlar görsel olarak:
   DO  = yumruk
   RE  = açık/el yönlü
   MI  = avuç aşağı
   FA  = başparmak aşağı
   SOL = açık el
   LA  = avuç/el
   SI  = işaret parmağı
*/

const HAND_SIGNS = {

    DO: "✊",

    RE: "🤚",

    MI: "🫳",

    FA: "👇",

    SOL: "✋",

    LA: "🫴",

    SI: "☝️",

    DO2: "✊"

};


function handSVG(note){

    const emoji =
        HAND_SIGNS[note] || "🎵";

    return `
        <span
            class="fonomimi-emoji"
            aria-label="${note}"
        >${emoji}</span>
    `;
}


/* =========================================================
   MEVCUT İŞARETLERİ YERLEŞTİR
========================================================= */

document
    .querySelectorAll(".hand-sign")
    .forEach(el => {

        const note =
            el.dataset.note;

        el.innerHTML =
            handSVG(note);

    });


/* =========================================================
   HEDEF NOTA
========================================================= */

function setTarget(index){

    if(index < 0){
        index = 0;
    }

    if(index >= NOTES.length){
        index = NOTES.length - 1;
    }

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
        .forEach((coin, i) => {

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
        .forEach((step, i) => {

            step.classList.toggle(
                "active-target",
                i === index
            );

        });


    pitchStatus.textContent =
        `SÖYLE: ${note.display}`;

    pitchStatus.className =
        "pitch-status";

    pitchHz.textContent =
        "—";

    correctSince = 0;

}


/* =========================================================
   KEDİ – BAŞLANGIÇ
========================================================= */

function positionCatAtStart(){

    if(!cat){
        return;
    }

    /*
       CSS'deki başlangıç alanına dön.
    */

    cat.style.left =
        "-88px";

    cat.style.bottom =
        "0px";

}


/* =========================================================
   KEDİ – BASAMAK KONUMU
========================================================= */

function positionCatOnStep(index){

    if(!cat || !ladder){
        return;
    }


    const step =
        document.querySelector(
            `.step[data-index="${index}"]`
        );


    if(!step){
        return;
    }


    /*
       offsetLeft / offsetTop kullanıyoruz.

       Böylece CSS'te bottom değerleri
       değişse bile karakter doğru yere
       oturuyor.
    */

    const x =
        step.offsetLeft +
        (step.offsetWidth / 2) -
        (cat.offsetWidth / 2);


    const y =
        step.offsetTop -
        cat.offsetHeight +
        8;


    cat.style.left =
        `${x}px`;

    cat.style.top =
        `${y}px`;

    /*
       top kullanıldığı için bottom'u temizle.
    */

    cat.style.bottom =
        "auto";

}


/* =========================================================
   KEDİ HAREKETİ
========================================================= */

function moveCatToStep(index){

    const now =
        performance.now();


    if(
        now - lastMoveTime <
        650
    ){
        return;
    }


    lastMoveTime =
        now;


    positionCatOnStep(index);


    cat.classList.remove("jump");


    /*
       CSS animasyonunu yeniden tetikle.
    */

    void cat.offsetWidth;


    cat.classList.add("jump");


    setTimeout(() => {

        cat.classList.remove("jump");

    }, 650);

}


/* =========================================================
   KARAKTER SEÇİMİ
========================================================= */

if(lokiBtn){

    lokiBtn.addEventListener(
        "click",
        () => {

            selectedCharacter =
                "loki";

            lokiBtn.classList.add(
                "active"
            );

            mayaBtn.classList.remove(
                "active"
            );

            cat.classList.remove(
                "maya"
            );

            cat.classList.add(
                "loki"
            );

        }
    );

}


if(mayaBtn){

    mayaBtn.addEventListener(
        "click",
        () => {

            selectedCharacter =
                "maya";

            mayaBtn.classList.add(
                "active"
            );

            lokiBtn.classList.remove(
                "active"
            );

            cat.classList.remove(
                "loki"
            );

            cat.classList.add(
                "maya"
            );

        }
    );

}


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


        setTimeout(() => {

            if(index !== currentStep){

                step.classList.remove(
                    "active-target"
                );

            }

        }, 700);

    }

}


/* =========================================================
   BASAMAK TIKLAMA
========================================================= */

document
    .querySelectorAll(".step")
    .forEach(step => {

        step.addEventListener(
            "click",
            event => {

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


/* =========================================================
   COIN TIKLAMA
========================================================= */

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
   PITCH DETECTION
========================================================= */

/*
   Önemli:

   Eski kod 4096 örnek üzerinde çok fazla
   autocorrelation hesabı yapıyordu.

   Bu sürüm daha küçük bir pencere kullanıyor
   ve sadece insan sesi aralığını tarıyor.
*/

function autoCorrelate(
    buffer,
    sampleRate
){

    const size =
        buffer.length;


    /*
       RMS / ses seviyesi
    */

    let rms = 0;


    for(
        let i = 0;
        i < size;
        i++
    ){

        rms +=
            buffer[i] *
            buffer[i];

    }


    rms =
        Math.sqrt(
            rms / size
        );


    if(rms < 0.012){

        return -1;

    }


    /*
       Ortalama çıkar.
    */

    let mean = 0;


    for(
        let i = 0;
        i < size;
        i++
    ){

        mean +=
            buffer[i];

    }


    mean /=
        size;


    /*
       İnsan sesi için
       90–700 Hz aralığı.
    */

    const minFreq = 90;
    const maxFreq = 700;


    const minLag =
        Math.floor(
            sampleRate / maxFreq
        );


    const maxLag =
        Math.min(
            Math.floor(
                sampleRate / minFreq
            ),
            size - 2
        );


    let bestLag = -1;

    let bestCorrelation = 0;


    /*
       Normalize autocorrelation.
    */

    for(
        let lag = minLag;
        lag <= maxLag;
        lag++
    ){

        let sum = 0;
        let energyA = 0;
        let energyB = 0;


        const limit =
            size - lag;


        for(
            let i = 0;
            i < limit;
            i++
        ){

            const a =
                buffer[i] -
                mean;


            const b =
                buffer[i + lag] -
                mean;


            sum +=
                a * b;


            energyA +=
                a * a;


            energyB +=
                b * b;

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
       Güvenilir pitch yok.
    */

    if(
        bestLag === -1 ||
        bestCorrelation < 0.60
    ){

        return -1;

    }


    /*
       Daha hassas frekans için
       komşu lag interpolasyonu.
    */

    let refinedLag =
        bestLag;


    if(
        bestLag > minLag &&
        bestLag < maxLag
    ){

        /*
           Yaklaşık parabolik düzeltme.
        */

        refinedLag =
            bestLag;

    }


    return (
        sampleRate /
        refinedLag
    );

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


    if(pitchFill){

        pitchFill.style.bottom =
            `${percent}%`;

    }

}


/* =========================================================
   PITCH İŞLE
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


    if(pitchHz){

        pitchHz.textContent =
            `${Math.round(frequency)} Hz`;

    }


    /*
       DOĞRU NOTA
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
           300 ms boyunca doğruysa
           coin alınır.
        */

        if(
            performance.now() -
            correctSince >=
            REQUIRED_HOLD_MS
        ){

            collectCurrentCoin();

        }


        return;

    }


    /*
       Yanlış nota.
    */

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


    const now =
        performance.now();


    /*
       CPU'yu boğmamak için
       pitch hesaplamasını 50 ms'de
       bir yap.
    */

    if(
        now -
        lastPitchProcessTime <
        PITCH_INTERVAL_MS
    ){

        pitchAnimation =
            requestAnimationFrame(
                detectPitch
            );

        return;

    }


    lastPitchProcessTime =
        now;


    /*
       2048 örnek pencere.
    */

    const buffer =
        new Float32Array(
            2048
        );


    analyser.getFloatTimeDomainData(
        buffer
    );


    /*
       Pitch için sadece ilk
       1024 örneği kullan.
    */

    const pitchBuffer =
        buffer.slice(
            0,
            1024
        );


    const frequency =
        autoCorrelate(
            pitchBuffer,
            audioContext.sampleRate
        );


    /*
       Sessizlik.
    */

    if(
        frequency === -1
    ){

        pitchStatus.textContent =
            "SES BEKLENİYOR";

        pitchStatus.className =
            "pitch-status";

        pitchHz.textContent =
            "—";

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
       Hareket devam ederken
       ikinci kez toplama.
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


    if(
        coin.classList.contains(
            "collected"
        )
    ){

        return;

    }


    /*
       Coin alındı.
    */

    coin.classList.add(
        "collected"
    );


    coins++;
    combo++;


    score +=
        100 +
        combo * 10;


    if(coinCount){

        coinCount.textContent =
            coins;

    }


    if(scoreElement){

        scoreElement.textContent =
            score;

    }


    if(comboElement){

        comboElement.textContent =
            combo;

    }


    /*
       Kedi hedef basamağa zıplar.
    */

    moveCatToStep(
        currentStep
    );


    /*
       Animasyonun ardından
       yeni hedef.
    */

    setTimeout(() => {

        advanceTarget();

    }, 650);

}


/* =========================================================
   SONRAKİ HEDEF
========================================================= */

function advanceTarget(){

    correctSince = 0;


    /*
       YUKARI
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
           DO'ya ulaştık.
           Şimdi aşağı.
        */

        direction = -1;


        setTarget(
            currentStep - 1
        );


        return;

    }


    /*
       AŞAĞI
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


    const instruction =
        document.getElementById(
            "instruction"
        );


    if(instruction){

        instruction.textContent =
            "Harika! Merdiveni tamamladın.";

    }

}


/* =========================================================
   MİKROFON BAŞLAT
========================================================= */

async function startMicrophone(){

    try{

        if(
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ){

            throw new Error(
                "getUserMedia desteklenmiyor."
            );

        }


        stream =
            await navigator
            .mediaDevices
            .getUserMedia({

                audio: {

                    /*
                       Şarkı söyleme / pitch
                       algılama için mümkün olduğunca
                       işlenmemiş mikrofon.
                    */

                    echoCancellation: false,

                    noiseSuppression: false,

                    autoGainControl: false,

                    channelCount: 1

                }

            });


        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        /*
           Chrome'da AudioContext bazen
           suspended başlayabilir.
        */

        if(
            audioContext.state ===
            "suspended"
        ){

            await audioContext.resume();

        }


        analyser =
            audioContext
            .createAnalyser();


        /*
           2048 pitch için yeterli.
        */

        analyser.fftSize =
            2048;


        analyser.smoothingTimeConstant =
            0;


        microphone =
            audioContext
            .createMediaStreamSource(
                stream
            );


        microphone.connect(
            analyser
        );


        lastPitchProcessTime = 0;


        micBtn.textContent =
            "🎤 Mikrofon Açık";


        micBtn.classList.add(
            "active"
        );


        pitchStatus.textContent =
            "SES BEKLENİYOR";


        pitchStatus.className =
            "pitch-status";


        detectPitch();


    }catch(error){

        console.error(
            "VOCALY Mikrofon Hatası:",
            error
        );


        gameStarted = false;


        if(startBtn){

            startBtn.disabled =
                false;

        }


        alert(
            "Mikrofon açılamadı. Tarayıcıda bu site için mikrofon iznini aç."
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
                track => {
                    track.stop();
                }
            );

        stream = null;

    }


    if(audioContext){

        audioContext
            .close()
            .catch(() => {});

        audioContext =
            null;

    }


    analyser = null;
    microphone = null;


    if(micBtn){

        micBtn.textContent =
            "🎤 Mikrofon";

        micBtn.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   BAŞLAT
========================================================= */

if(startBtn){

    startBtn.addEventListener(
        "click",
        async () => {

            resetGame();


            gameStarted = true;


            startBtn.disabled =
                true;


            await startMicrophone();

        }
    );

}


/* =========================================================
   MİKROFON BUTONU
========================================================= */

if(micBtn){

    micBtn.addEventListener(
        "click",
        async () => {

            if(stream){

                stopMicrophone();

                return;

            }


            await startMicrophone();

        }
    );

}


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
    lastPitchProcessTime = 0;


    /*
       Coinleri sıfırla.
    */

    document
        .querySelectorAll(".coin")
        .forEach(coin => {

            coin.classList.remove(
                "collected"
            );

        });


    if(coinCount){

        coinCount.textContent =
            "0";

    }


    if(scoreElement){

        scoreElement.textContent =
            "0";

    }


    if(comboElement){

        comboElement.textContent =
            "0";

    }


    if(startBtn){

        startBtn.disabled =
            false;

    }


    /*
       Kedi başlangıç noktasına.
    */

    positionCatAtStart();


    /*
       İlk hedef DO.
    */

    setTarget(0);


    if(pitchStatus){

        pitchStatus.textContent =
            "HAZIR";

        pitchStatus.className =
            "pitch-status";

    }


    if(pitchHz){

        pitchHz.textContent =
            "—";

    }


    if(pitchFill){

        pitchFill.style.bottom =
            "50%";

    }


    const instruction =
        document.getElementById(
            "instruction"
        );


    if(instruction){

        instruction.textContent =
            "Do sesini söyle.";

    }

}


/* =========================================================
   BAŞLANGIÇ
========================================================= */

window.addEventListener(
    "load",
    () => {

        setTarget(0);


        positionCatAtStart();


        /*
           Loki varsayılan.
        */

        if(cat){

            cat.classList.remove(
                "maya"
            );

            cat.classList.add(
                "loki"
            );

        }


        if(lokiBtn){

            lokiBtn.classList.add(
                "active"
            );

        }

    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
           Oyun sırasında kedi
           mevcut basamağa yeniden
           oturtulsun.
        */

        if(
            gameStarted &&
            currentStep >= 0
        ){

            positionCatOnStep(
                currentStep
            );

        }

    }
);
