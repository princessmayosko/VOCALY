/* =========================================================
   VOCALY FONOMİMİ MERDİVENİ – KİLİTLENME HOTFIX
   Bu kodu mevcut JS DOSYASININ EN ALTINA ekle.
========================================================= */

let _vocalyTriggeredStep = -1;

/*
   Doğru perde:
   hedef frekansa ±30 cent içindeyse
   anında kabul edilir.
*/
function processPitch(frequency){

    if(!gameStarted || !frequency || _vocalyTriggeredStep === currentStep){
        return;
    }

    const target = NOTES[currentStep];

    const cents = 1200 * Math.log2(
        frequency / target.freq
    );

    if(typeof updatePitchMeter === "function"){
        updatePitchMeter(cents);
    }

    const detected =
        typeof frequencyToNoteInfo === "function"
            ? frequencyToNoteInfo(frequency)
            : null;

    const detectedText =
        detected ? detected.note : "—";

    if(pitchHz){
        pitchHz.textContent = detectedText;
    }

    const correct =
        Math.abs(cents) <= 30;

    if(correct){

        /* Aynı nota için ikinci tetiklemeyi engelle */
        _vocalyTriggeredStep = currentStep;

        if(pitchStatus){
            pitchStatus.textContent =
                `HEDEF: ${target.display} • DUYULAN: ${detectedText} ✓`;
            pitchStatus.className =
                "pitch-status correct";
        }

        /*
           Burada targetLocked'a güvenmiyoruz.
           Doğrudan coin + kedi hareketi.
        */
        collectCurrentCoin();

        return;
    }

    if(pitchStatus){
        pitchStatus.textContent =
            `HEDEF: ${target.display} • DUYULAN: ${detectedText}`;
        pitchStatus.className =
            "pitch-status";
    }
}


/*
   Coin/kedi hareketini targetLocked'dan bağımsızlaştırıyoruz.
*/
function collectCurrentCoin(){

    if(!gameStarted){
        return;
    }

    const stepIndex = currentStep;

    const coin = document.querySelector(
        `.coin[data-index="${stepIndex}"]`
    );

    /*
       Coin varsa görsel olarak al.
    */
    if(coin){
        if(coin.classList.contains("collected")){
            return;
        }

        coin.classList.add("collected");
    }

    /*
       Skor.
    */
    coins++;
    combo++;
    score += 100 + combo * 10;

    if(coinCount){
        coinCount.textContent = coins;
    }

    if(scoreElement){
        scoreElement.textContent = score;
    }

    if(comboElement){
        comboElement.textContent = combo;
    }

    /*
       KEDİYİ HEMEN HEDEF BASAMAĞA ZIPLAT.
    */
    moveCatToStep(stepIndex);

    /*
       Yeni hedef.
    */
    setTimeout(() => {

        _vocalyTriggeredStep = -1;

        advanceTarget();

    }, 650);
}


/*
   Reset'te hotfix kilidini de sıfırla.
*/
const _oldResetGame = resetGame;

resetGame = function(){

    _vocalyTriggeredStep = -1;

    _oldResetGame();

};


/*
   Hedef değiştiğinde de kilidi sıfırla.
*/
const _oldSetTarget = setTarget;

setTarget = function(index){

    _vocalyTriggeredStep = -1;

    _oldSetTarget(index);

};
