/* =========================================================
   VOCALY – FONOMİMİ MERDİVENİ
   TEMİZ SÜRÜM
   - Pitch: ±30 cent
   - Doğru perde: anında coin + kedi zıplaması
   - Basamak/coin: referans ses
   - Loki / Maya
========================================================= */

const NOTES = [
  { name:"DO",  display:"DO",  freq:261.63 },
  { name:"RE",  display:"RE",  freq:293.66 },
  { name:"MI",  display:"Mİ",  freq:329.63 },
  { name:"FA",  display:"FA",  freq:349.23 },
  { name:"SOL", display:"SOL", freq:392.00 },
  { name:"LA",  display:"LA",  freq:440.00 },
  { name:"SI",  display:"Sİ",  freq:493.88 },
  { name:"DO2", display:"DO'", freq:523.25 }
];

const HAND_SIGNS = {
  DO:"✊",
  RE:"🤚",
  MI:"🫳",
  FA:"👇",
  SOL:"✋",
  LA:"🫴",
  SI:"☝️",
  DO2:"✊"
};

const CENT_TOLERANCE = 30;
const PITCH_INTERVAL_MS = 45;

let cat, ladder, targetNote, targetHand;
let pitchFill, pitchStatus, pitchHz;
let coinCount, scoreElement, comboElement;
let micBtn, startBtn, resetBtn, lokiBtn, mayaBtn;

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
let lastPitchProcessTime = 0;
let stepLocked = false;

let referenceAudioContext = null;


/* =========================================================
   YARDIMCI
========================================================= */

function handSVG(note){
  return `<span class="fonomimi-emoji" aria-label="${note}">${HAND_SIGNS[note] || "🎵"}</span>`;
}

function getStep(index){
  return document.querySelector(`.step[data-index="${index}"]`);
}


/* =========================================================
   HEDEF
========================================================= */

function setTarget(index){
  index = Math.max(0, Math.min(NOTES.length - 1, index));
  currentStep = index;
  stepLocked = false;

  const note = NOTES[index];

  if(targetNote) targetNote.textContent = note.display;
  if(targetHand) targetHand.innerHTML = handSVG(note.name);

  document.querySelectorAll(".coin").forEach((coin,i)=>{
    coin.classList.toggle("inactive", i !== index);
  });

  document.querySelectorAll(".step").forEach((step,i)=>{
    step.classList.toggle("active-target", i === index);
  });

  if(pitchStatus){
    pitchStatus.textContent = `HEDEF: ${note.display} • DUYULAN: —`;
    pitchStatus.className = "pitch-status";
  }

  if(pitchHz) pitchHz.textContent = "—";
  if(pitchFill) pitchFill.style.bottom = "50%";
}


/* =========================================================
   KEDİ
   ÖNEMLİ DÜZELTME:
   offsetLeft/offsetTop yerine ekran koordinatları kullanılıyor.
   Böylece cat başka bir container içinde olsa bile doğru basamağa
   taşınır.
========================================================= */

function positionCatAtStart(){
  if(!cat) return;

  cat.style.transform = "translate(0,0)";
  cat.style.left = "-88px";
  cat.style.top = "auto";
  cat.style.bottom = "0px";
}

function positionCatOnStep(index){
  if(!cat) return;

  const step = getStep(index);
  if(!step) return;

  const parent = cat.offsetParent || cat.parentElement;
  if(!parent) return;

  const stepRect = step.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const catWidth = cat.getBoundingClientRect().width || cat.offsetWidth || 70;
  const catHeight = cat.getBoundingClientRect().height || cat.offsetHeight || 70;

  /*
     Kedi basamağın üstüne, yatayda tam ortasına yerleşir.
  */
  const x =
    stepRect.left -
    parentRect.left +
    (stepRect.width / 2) -
    (catWidth / 2);

  const y =
    stepRect.top -
    parentRect.top -
    catHeight +
    10;

  cat.style.left = `${Math.round(x)}px`;
  cat.style.top = `${Math.round(y)}px`;
  cat.style.bottom = "auto";
  cat.style.transform = "translate(0,0)";
}

function moveCatToStep(index){
  if(!cat) return;

  /*
     Önce gerçek hedef konuma götür.
  */
  positionCatOnStep(index);

  /*
     Sonra jump animasyonunu tetikle.
  */
  cat.classList.remove("jump");
  void cat.offsetWidth;
  cat.classList.add("jump");

  setTimeout(()=>{
    if(cat) cat.classList.remove("jump");
  }, 700);
}


/* =========================================================
   REFERANS SES
========================================================= */

function playReferenceNote(index){
  const note = NOTES[index];
  if(!note) return;

  try{
    if(!referenceAudioContext){
      referenceAudioContext =
        new (window.AudioContext || window.webkitAudioContext)();
    }

    if(referenceAudioContext.state === "suspended"){
      referenceAudioContext.resume();
    }

    const ctx = referenceAudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = note.freq;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  }catch(err){
    console.error("Referans ses hatası:", err);
  }
}


/* =========================================================
   PITCH
========================================================= */

function autoCorrelate(buf, sampleRate){
  let SIZE = buf.length;

  let rms = 0;
  for(let i=0;i<SIZE;i++){
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / SIZE);

  if(rms < 0.008) return -1;

  let bestOffset = -1;
  let bestCorrelation = 0;

  /*
     İnsan sesi için yaklaşık 80–1000 Hz.
     Daha dar aralık yanlış oktavları azaltır.
  */
  const minLag = Math.floor(sampleRate / 1000);
  const maxLag = Math.min(
    Math.floor(sampleRate / 80),
    SIZE - 2
  );

  let previous = 1;

  for(let lag=minLag; lag<=maxLag; lag++){
    let sum = 0;
    let normA = 0;
    let normB = 0;

    for(let i=0; i<SIZE-lag; i++){
      const a = buf[i];
      const b = buf[i+lag];
      sum += a*b;
      normA += a*a;
      normB += b*b;
    }

    const correlation =
      sum / Math.sqrt((normA * normB) || 1);

    if(correlation > bestCorrelation){
      bestCorrelation = correlation;
      bestOffset = lag;
    }

    if(correlation > 0.99 && correlation < previous){
      break;
    }

    previous = correlation;
  }

  if(bestOffset < 1 || bestCorrelation < 0.45) return -1;

  return sampleRate / bestOffset;
}

function frequencyToNoteInfo(frequency){
  if(!frequency || frequency <= 0) return null;

  const names = [
    "DO","DO#","RE","RE#","Mİ","FA",
    "FA#","SOL","SOL#","LA","LA#","Sİ"
  ];

  const midiFloat =
    69 + 12 * Math.log2(frequency / 440);

  const midiNearest = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midiNearest) * 100);
  const noteIndex = ((midiNearest % 12) + 12) % 12;

  return {
    note:names[noteIndex],
    cents,
    midi:midiNearest,
    frequency
  };
}

function centsFromFrequency(frequency, targetFrequency){
  return 1200 * Math.log2(frequency / targetFrequency);
}


/* =========================================================
   PITCH GÖSTERGESİ
========================================================= */

function updatePitchMeter(cents){
  const limited = Math.max(-100, Math.min(100, cents));
  const percent = 50 + limited / 2;

  if(pitchFill){
    pitchFill.style.bottom = `${percent}%`;
  }
}


/* =========================================================
   DOĞRU PERDE
========================================================= */

function processPitch(frequency){
  if(!gameStarted || stepLocked || !frequency) return;

  const target = NOTES[currentStep];
  const cents = centsFromFrequency(frequency, target.freq);

  updatePitchMeter(cents);

  const detected = frequencyToNoteInfo(frequency);
  const detectedText = detected ? detected.note : "—";

  if(pitchHz) pitchHz.textContent = detectedText;

  /*
     KARAR SADECE FREKANSA GÖRE:
     ±30 cent içindeyse doğru.
     Nota ismi karşılaştırması yapılmıyor.
  */
  if(Math.abs(cents) <= CENT_TOLERANCE){

    stepLocked = true;

    if(pitchStatus){
      pitchStatus.textContent =
        `HEDEF: ${target.display} • DUYULAN: ${detectedText} ✓`;
      pitchStatus.className = "pitch-status correct";
    }

    collectCurrentCoin();
    return;
  }

  if(pitchStatus){
    pitchStatus.textContent =
      `HEDEF: ${target.display} • DUYULAN: ${detectedText}`;
    pitchStatus.className = "pitch-status";
  }
}


/* =========================================================
   PITCH DÖNGÜSÜ
========================================================= */

function detectPitch(){
  if(!analyser || !audioContext) return;

  const now = performance.now();

  if(now - lastPitchProcessTime < PITCH_INTERVAL_MS){
    pitchAnimation = requestAnimationFrame(detectPitch);
    return;
  }

  lastPitchProcessTime = now;

  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);

  const frequency =
    autoCorrelate(buffer, audioContext.sampleRate);

  if(frequency === -1){
    if(pitchHz) pitchHz.textContent = "—";
    if(pitchFill) pitchFill.style.bottom = "50%";

    if(pitchStatus && gameStarted){
      pitchStatus.textContent =
        `HEDEF: ${NOTES[currentStep].display} • DUYULAN: —`;
      pitchStatus.className = "pitch-status";
    }
  }else{
    processPitch(frequency);
  }

  pitchAnimation = requestAnimationFrame(detectPitch);
}


/* =========================================================
   COIN + ZIPLAMA
========================================================= */

function collectCurrentCoin(){
  if(!gameStarted) return;

  const index = currentStep;
  const coin = document.querySelector(`.coin[data-index="${index}"]`);

  if(coin && coin.classList.contains("collected")) return;

  if(coin) coin.classList.add("collected");

  coins++;
  combo++;
  score += 100 + combo * 10;

  if(coinCount) coinCount.textContent = coins;
  if(scoreElement) scoreElement.textContent = score;
  if(comboElement) comboElement.textContent = combo;

  /*
     EN ÖNEMLİ SATIR:
     doğru perde geldiği anda kedi hedef basamağa gider.
  */
  moveCatToStep(index);

  setTimeout(()=>{
    advanceTarget();
  }, 700);
}


/* =========================================================
   YENİ HEDEF
========================================================= */

function advanceTarget(){

  if(direction === 1){

    if(currentStep < NOTES.length - 1){
      setTarget(currentStep + 1);
      return;
    }

    direction = -1;
    setTarget(currentStep - 1);
    return;
  }

  if(direction === -1){

    if(currentStep > 0){
      setTarget(currentStep - 1);
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

  if(pitchStatus){
    pitchStatus.textContent = "🎉 TAMAMLANDI!";
    pitchStatus.className = "pitch-status correct";
  }

  const instruction = document.getElementById("instruction");
  if(instruction){
    instruction.textContent =
      "Harika! Merdiveni tamamladın.";
  }

  if(startBtn) startBtn.disabled = false;
}


/* =========================================================
   MİKROFON
========================================================= */

async function startMicrophone(){

  try{

    if(!navigator.mediaDevices ||
       !navigator.mediaDevices.getUserMedia){
      throw new Error("getUserMedia desteklenmiyor.");
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio:{
        echoCancellation:false,
        noiseSuppression:false,
        autoGainControl:false,
        channelCount:1
      }
    });

    audioContext =
      new (window.AudioContext || window.webkitAudioContext)();

    if(audioContext.state === "suspended"){
      await audioContext.resume();
    }

    analyser = audioContext.createAnalyser();

    /*
       2048: pitch için yeterli çözünürlük.
    */
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;

    microphone =
      audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    lastPitchProcessTime = 0;

    if(micBtn){
      micBtn.textContent = "🎤 Mikrofon Açık";
      micBtn.classList.add("active");
    }

    if(pitchStatus){
      pitchStatus.textContent =
        `HEDEF: ${NOTES[currentStep].display} • DUYULAN: —`;
      pitchStatus.className = "pitch-status";
    }

    if(pitchAnimation){
      cancelAnimationFrame(pitchAnimation);
    }

    detectPitch();

  }catch(error){

    console.error("VOCALY Mikrofon Hatası:", error);

    gameStarted = false;

    if(startBtn) startBtn.disabled = false;

    alert(
      "Mikrofon açılamadı. Tarayıcıda bu site için mikrofon iznini aç."
    );
  }
}


function stopMicrophone(){

  if(pitchAnimation){
    cancelAnimationFrame(pitchAnimation);
    pitchAnimation = null;
  }

  if(stream){
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  if(audioContext){
    audioContext.close().catch(()=>{});
    audioContext = null;
  }

  analyser = null;
  microphone = null;

  if(micBtn){
    micBtn.textContent = "🎤 Mikrofon";
    micBtn.classList.remove("active");
  }
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
  stepLocked = false;

  document.querySelectorAll(".coin").forEach(coin=>{
    coin.classList.remove("collected");
  });

  if(coinCount) coinCount.textContent = "0";
  if(scoreElement) scoreElement.textContent = "0";
  if(comboElement) comboElement.textContent = "0";

  if(startBtn) startBtn.disabled = false;

  positionCatAtStart();
  setTarget(0);

  const instruction = document.getElementById("instruction");
  if(instruction){
    instruction.textContent =
      "Hedef notayı söyle. Kedi doğru perdeyi duyduğunda coin’i alır.";
  }
}


/* =========================================================
   UI
========================================================= */

function initUI(){

  cat = document.getElementById("cat");
  ladder = document.getElementById("ladder");
  targetNote = document.getElementById("targetNote");
  targetHand = document.getElementById("targetHand");
  pitchFill = document.getElementById("pitchFill");
  pitchStatus = document.getElementById("pitchStatus");
  pitchHz = document.getElementById("pitchHz");
  coinCount = document.getElementById("coinCount");
  scoreElement = document.getElementById("score");
  comboElement = document.getElementById("combo");
  micBtn = document.getElementById("micBtn");
  startBtn = document.getElementById("startBtn");
  resetBtn = document.getElementById("resetBtn");
  lokiBtn = document.getElementById("lokiBtn");
  mayaBtn = document.getElementById("mayaBtn");

  /*
     Fonomimi işaretlerini HTML'deki .hand-sign elemanlarına bas.
  */
  document.querySelectorAll(".hand-sign").forEach(el=>{
    const note = el.dataset.note;
    el.innerHTML = handSVG(note);
  });

  if(lokiBtn){
    lokiBtn.addEventListener("click",()=>{
      selectedCharacter = "loki";
      lokiBtn.classList.add("active");
      if(mayaBtn) mayaBtn.classList.remove("active");

      if(cat){
        cat.classList.remove("maya");
        cat.classList.add("loki");
      }
    });
  }

  if(mayaBtn){
    mayaBtn.addEventListener("click",()=>{
      selectedCharacter = "maya";
      mayaBtn.classList.add("active");
      if(lokiBtn) lokiBtn.classList.remove("active");

      if(cat){
        cat.classList.remove("loki");
        cat.classList.add("maya");
      }
    });
  }

  /*
     Basamak tıklanınca referans ses.
  */
  document.querySelectorAll(".step").forEach(step=>{
    step.addEventListener("click",event=>{
      if(event.target.closest(".coin")) return;

      const index = Number(step.dataset.index);

      if(Number.isInteger(index) && NOTES[index]){
        playReferenceNote(index);
      }
    });
  });

  /*
     Coin tıklanınca da referans ses.
  */
  document.querySelectorAll(".coin").forEach(coin=>{
    coin.addEventListener("click",event=>{
      event.stopPropagation();

      const index = Number(coin.dataset.index);

      if(Number.isInteger(index) && NOTES[index]){
        playReferenceNote(index);
      }
    });
  });

  /*
     BAŞLA
  */
  if(startBtn){
    startBtn.addEventListener("click",async()=>{
      resetGame();

      gameStarted = true;
      stepLocked = false;

      startBtn.disabled = true;

      await startMicrophone();
    });
  }

  /*
     Mikrofon butonu
  */
  if(micBtn){
    micBtn.addEventListener("click",async()=>{

      if(stream){
        stopMicrophone();
        return;
      }

      if(!gameStarted){
        gameStarted = true;
      }

      await startMicrophone();
    });
  }

  /*
     Yeniden
  */
  if(resetBtn){
    resetBtn.addEventListener("click",()=>{
      resetGame();
    });
  }

  setTarget(0);
  positionCatAtStart();

  if(cat){
    cat.classList.remove("maya");
    cat.classList.add("loki");
  }

  if(lokiBtn){
    lokiBtn.classList.add("active");
  }

  /*
     Pencere boyutu değişince kedi mevcut basamağa yeniden hizalanır.
  */
  window.addEventListener("resize",()=>{
    if(gameStarted){
      positionCatOnStep(currentStep);
    }
  });
}


/* =========================================================
   BAŞLAT
========================================================= */

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded",initUI,{once:true});
}else{
  initUI();
}
