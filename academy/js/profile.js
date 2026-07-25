
/* ==========================================
   VOCALY Akademi
   Profile Manager
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (Student.exists()) {

        window.location.href = "index.html";
        return;

    }

    const form = document.getElementById("studentForm");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const student = Student.defaultData();

        student.ad = document.getElementById("ad").value.trim();

        student.soyad = document.getElementById("soyad").value.trim();

        student.okul = document.getElementById("okul").value.trim();

        student.okulNo = document.getElementById("okulNo").value.trim();

        student.sinif = document.getElementById("sinif").value.trim();

        student.sube = document.getElementById("sube").value.trim();

        student.id = crypto.randomUUID();

        Student.save(student);

        window.location.href = "index.html";

    });

});
