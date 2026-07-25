// Sesi çal
function playSound() {

    if (game.currentAudio) {
        game.currentAudio.pause();
    }

    const question = game.questions[game.currentIndex];

    console.log("Question:", question);
    console.log("Ses yolu:", question.sound);

    game.currentAudio = new Audio(question.sound);

    game.currentAudio.play()
        .then(() => {
            console.log("Ses başarıyla çaldı.");
        })
        .catch(err => {
            console.error("Ses çalma hatası:", err);
        });

    game.replayCount++;

}
