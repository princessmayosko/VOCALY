// ==========================================
// VOCALY AKADEMİ
// İnce - Kalın Ses Avı
// v1.0
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

// Sayfa yüklendiğinde oyunu başlat
window.addEventListener("DOMContentLoaded", initGame);

async function initGame() {

    await loadQuestions();

    shuffleQuestions();

    updateUI();

    registerEvents();

}

// JSON'u yükle
async function loadQuestions() {

    try {

        const response = await fetch("data/high_low.json");

        const data = await response.json();

        game.questions = data.questions;

    }

    catch (err) {

        console.error(err);

        alert("Sorular yüklenemedi.");

    }

}

// Soruları karıştır
function shuffleQuestions() {

    game.questions.sort(() => Math.random() - 0.5);

}

// Buton olayları
function registerEvents() {

    document
        .getElementById("playButton")
        .addEventListener("click", playSound);

    document
        .getElementById("highBtn")
        .addEventListener("click", () => checkAnswer("ince"));

    document
        .getElementById("lowBtn")
        .addEventListener("click", () => checkAnswer("kalin"));

}

// Güncel bilgileri ekrana yaz
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

// Sesi çal
function playSound() {

    if (game.currentAudio) {

        game.currentAudio.pause();

    }

    const question = game.questions[game.currentIndex];

    game.currentAudio = new Audio(question.sound);

    game.currentAudio.play();

    game.replayCount++;

}

// Cevabı kontrol et
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

    }

    else {

        game.wrong++;

        feedback.textContent = "🙂 Tekrar deneyelim.";

        feedback.style.color = "#ff4d4f";

    }

    setTimeout(nextQuestion,1200);

}

// Sonraki soru
function nextQuestion() {

    game.currentIndex++;

    game.replayCount = 0;

    if (game.currentIndex >= game.questions.length) {

        finishGame();

        return;

    }

    document.getElementById("feedback").textContent =
        "Hazır mısın?";

    document.getElementById("feedback").style.color =
        "#ffffff";

    updateUI();

}

// Oyun bitti
function finishGame() {

    const percent =
        Math.round((game.score / game.questions.length) * 100);

    alert(

`Etkinlik Tamamlandı

Doğru : ${game.score}

Yanlış : ${game.wrong}

Başarı : %${percent}`

    );

    console.table(game.results);

}