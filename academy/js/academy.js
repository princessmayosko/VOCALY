/* ==========================================
   VOCALY Akademi
   Academy Manager v1.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Öğrenci kayıtlı değilse profile sayfasına gönder
    if (!Student.exists()) {

        window.location.href = "profile.html";
        return;

    }

    const student = Student.load();

    // Karşılama
    const welcomeTitle = document.getElementById("welcomeTitle");
    if (welcomeTitle) {

        welcomeTitle.textContent = `Hoş Geldin, ${student.ad}!`;

    }

    // Öğrenci bilgileri
    const studentInfo = document.getElementById("studentInfo");
    if (studentInfo) {

        let info = "";

        if (student.sinif) {

            info += `${student.sinif}`;

            if (student.sube) {
                info += `/${student.sube}`;
            }

        }

        if (student.okulNo) {

            if (info !== "") info += " • ";

            info += `No: ${student.okulNo}`;

        }

        if (student.okul) {

            if (info !== "") info += "<br>";

            info += student.okul;

        }

        studentInfo.innerHTML = info;

    }

    // İstatistikler
    document.getElementById("studentLevel").textContent = student.level;
    document.getElementById("studentXP").textContent = student.xp;
    document.getElementById("studentBadges").textContent = student.badges.length;

    // Progress (her seviye 100 XP)
    const currentXP = student.xp % 100;
    const percent = currentXP;

    document.getElementById("progressPercent").textContent = `%${percent}`;
    document.getElementById("progressFill").style.width = percent + "%";

});
