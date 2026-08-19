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

const CENT_TOLERANCE = 30;

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
        `HEDEF: ${note.display}  •  DUYULAN: —`;

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

function autoCorrelate(buf, sampleRate){

    let SIZE = buf.length;

    let rms = 0;

    for(let i = 0; i < SIZE; i++){
        const val = buf[i];
        rms += val * val;
    }

    rms = Math.sqrt(rms / SIZE);

    if(rms < 0.01){
        return -1;
    }

    let r1 = 0;
    let r2 = SIZE - 1;
    const threshold = 0.2;

    for(let i = 0; i < SIZE / 2; i++){
        if(Math.abs(buf[i]) < threshold){
            r1 = i;
            break;
        }
    }

    for(let i = 1; i < SIZE / 2; i++){
        if(Math.abs(buf[SIZE - i]) < threshold){
            r2 = SIZE - i;
            break;
        }
    }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    const c = new Array(SIZE).fill(0);

    for(let i = 0; i < SIZE; i++){
        for(let j = 0; j < SIZE - i; j++){
            c[i] += buf[j] * buf[j + i];
        }
    }

    let d = 0;
    while(d + 1 < SIZE && c[d] > c[d + 1]){
        d++;
    }

    let maxval = -1;
    let maxpos = -1;

    for(let i = d; i < SIZE; i++){
        if(c[i] > maxval){
            maxval = c[i];
            maxpos = i;
        }
    }

    const T0 = maxpos;

    if(T0 <= 0){
        return -1;
    }

    return sampleRate / T0;

}


/* =========================================================
   FREKANS → NOTA
========================================================= */
function frequencyToNoteInfo(frequency){

    if(!frequency || frequency <= 0){
        return null;
    }

    const names = [
        "DO", "DO#", "RE", "RE#", "Mİ", "FA",
        "FA#", "SOL", "SOL#", "LA", "LA#", "Sİ"
    ];

    const midiFloat =
        69 + 12 * Math.log2(frequency / 440);

    const midiNearest = Math.round(midiFloat);

    const cents =
        Math.round((midiFloat - midiNearest) * 100);

    const noteIndex =
        ((midiNearest % 12) + 12) % 12;

    return {
        note: names[noteIndex],
        cents: cents,
        midi: midiNearest,
        frequency: frequency
    };

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

function processPitch(frequency){

    if(!gameStarted){
        return;
    }

    const target = NOTES[currentStep];

    const cents =
        centsFromFrequency(
            frequency,
            target.freq
        );

    updatePitchMeter(cents);

    const detected =
        frequencyToNoteInfo(frequency);

    /*
       Artık Hz göstermiyoruz.
       Öğrencinin göreceği şey doğrudan nota adı:
       HEDEF NOTA: DO
       DUYULAN NOTA: RE
    */
    if(pitchHz){
        pitchHz.textContent =
            detected ? detected.note : "—";
    }

    const detectedText =
        detected ? detected.note : "—";

    if(
        pitchStatus
    ){
        pitchStatus.textContent =
            `HEDEF: ${target.display}  •  DUYULAN: ${detectedText}`;
    }

    /*
       Doğru hedef perde.
       30 cent tolerans içinde ve 300 ms tutulursa
       coin alınır.
    */
    if(
        Math.abs(cents) <= CENT_TOLERANCE
    ){

        if(pitchStatus){
            pitchStatus.textContent =
                `HEDEF: ${target.display}  •  DUYULAN: ${detectedText} ✓`;
            pitchStatus.className =
                "pitch-status correct";
        }

        if(!correctSince){
            correctSince = performance.now();
        }

        if(
            performance.now() - correctSince >=
            REQUIRED_HOLD_MS
        ){
            collectCurrentCoin();
        }

        return;
    }

    correctSince = 0;

    if(pitchStatus){
        pitchStatus.className =
            "pitch-status wrong";
    }

}


/* =========================================================
   PITCH DÖNGÜSÜ
========================================================= */

function detectPitch(){

    if(!analyser || !audioContext){
        return;
    }

    const now = performance.now();

    if(
        now - lastPitchProcessTime <
        PITCH_INTERVAL_MS
    ){
        pitchAnimation =
            requestAnimationFrame(detectPitch);
        return;
    }

    lastPitchProcessTime = now;

    /*
       VOCALY Cetvel ile aynı 2048 örnek pencere.
       1024'e kırpmıyoruz.
    */
    const buffer =
        new Float32Array(
            analyser.fftSize
        );

    analyser.getFloatTimeDomainData(buffer);

    const frequency =
        autoCorrelate(
            buffer,
            audioContext.sampleRate
        );

    if(frequency === -1){

        if(pitchStatus){
            pitchStatus.textContent =
                `HEDEF: ${NOTES[currentStep].display}  •  DUYULAN: —`;
            pitchStatus.className =
                "pitch-status";
        }

        if(pitchHz){
            pitchHz.textContent = "—";
        }

        if(pitchFill){
            pitchFill.style.bottom = "50%";
        }

        correctSince = 0;

        pitchAnimation =
            requestAnimationFrame(detectPitch);

        return;
    }

    processPitch(frequency);

    pitchAnimation =
        requestAnimationFrame(detectPitch);

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
            `HEDEF: ${NOTES[currentStep].display}  •  DUYULAN: —`;


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
            "HEDEF: DO  •  DUYULAN: —";

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
            "Hedef notayı söyle. Kedi doğru perdeyi duyduğunda coin’i alır.";

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
