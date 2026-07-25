// ==========================================
// VOCALY AKADEMİ
// İnce - Kalın Ses Avı
// ==========================================

const game = {
    questions: [],
    currentIndex: 0,
    score: 0,
    wrong: 0,
    currentAudio: null,
    replayCount: 0,
    results: []
};

window.addEventListener("DOMContentLoaded", initGame);

async function initGame() {

    await loadQuestions();

    shuffleQuestions();

    updateUI();

    registerEvents();

}

async function loadQuestions() {

    try {

        const response = await fetch("data/high_low.json");

        const data = await response.json();

        game.questions = data.questions;

    } catch (err) {

        console.error(err);

        alert("Sorular yüklenemedi.");

    }

}

function shuffleQuestions() {

    game.questions.sort(() => Math.random() - 0.5);

}

function registerEvents() {

    const playButton = document.getElementById("playButton");
    const highBtn = document.getElementById("highBtn");
    const lowBtn = document.getElementById("lowBtn");

    playButton.addEventListener("click", playSound);

    highBtn.addEventListener("click", () => checkAnswer("ince"));

    lowBtn.addEventListener("click", () => checkAnswer("kalin"));

    const toggleInfo = document.getElementById("toggleInfo");
const infoContent = document.getElementById("infoContent");
const infoArrow = document.getElementById("infoArrow");

toggleInfo.addEventListener("click", () => {

    infoContent.classList.toggle("hidden");

    if(infoContent.classList.contains("hidden")){
        infoArrow.textContent = "▼";
    }
    else{
        infoArrow.textContent = "▲";
    }

});

    // Etkinlik Bilgileri Aç / Kapat

    const toggleInfo = document.getElementById("toggleInfo");
    const infoContent = document.getElementById("infoContent");
    const infoArrow = document.getElementById("infoArrow");

    if (toggleInfo && infoContent && infoArrow) {

        toggleInfo.addEventListener("click", () => {

            infoContent.classList.toggle("hidden");

            if (infoContent.classList.contains("hidden")) {

                infoArrow.textContent = "▼";

            } else {

                infoArrow.textContent = "▲";

            }

        });

    }

}

function updateUI() {

    document.getElementById("questionNumber").textContent =
        `${game.currentIndex + 1} / ${game.questions.length}`;

    document.getElementById("score").textContent =
        `${game.score} Puan`;

    const percent =
        (game.currentIndex / game.questions.length) * 100;

    document.getElementById("progressFill").style.width =
        percent + "%";

}

function playSound() {

    if (game.currentAudio) {

        game.currentAudio.pause();

        game.currentAudio.currentTime = 0;

    }

    const question = game.questions[game.currentIndex];

    game.currentAudio = new Audio(question.sound);

    game.currentAudio.play().catch(console.error);

    game.replayCount++;

}

function checkAnswer(answer) {

    const question = game.questions[game.currentIndex];

    const feedback = document.getElementById("feedback");

    const correct = answer === question.answer;

    game.results.push({

        questionId: question.id,
        answer,
        correct,
        replay: game.replayCount

    });

    if (correct) {

        game.score++;

        feedback.textContent = "⭐ Harika!";

        feedback.style.color = "#30d158";

    } else {

        game.wrong++;

        feedback.textContent = "🙂 Tekrar deneyelim.";

        feedback.style.color = "#ff4d4f";

    }

    updateUI();

    setTimeout(nextQuestion, 1200);

}

function nextQuestion() {

    game.currentIndex++;

    game.replayCount = 0;

    if (game.currentIndex >= game.questions.length) {

        finishGame();

        return;

    }

    document.getElementById("feedback").textContent = "Hazır mısın?";

    document.getElementById("feedback").style.color = "#ffffff";

    updateUI();

}

function finishGame() {

    const percent =
        Math.round((game.score / game.questions.length) * 100);

    document.getElementById("resultScreen").classList.remove("hidden");

    document.getElementById("finalScore").textContent =
        `Doğru: ${game.score} | Yanlış: ${game.wrong} | Başarı: %${percent}`;

    document.getElementById("earnedXP").textContent =
        "Etkinlik başarıyla tamamlandı.";

    console.table(game.results);

}
