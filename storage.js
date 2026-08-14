function saveProgress(data){

    const student =
    JSON.parse(
        localStorage.getItem("studentInfo")
    );


    if(!student){
        console.log("Öğrenci bulunamadı");
        return;
    }


    let records =
    JSON.parse(
        localStorage.getItem("vocalyProgress")
    ) || [];


    records.push({

        studentName: student.name,
        studentNumber: student.number,
        className: student.className,
        school: student.school,

        song:data.song,
        score:data.score,

        date:new Date().toLocaleDateString("tr-TR"),
        time:new Date().toLocaleTimeString("tr-TR"),

        audio:null

    });


    localStorage.setItem(
        "vocalyProgress",
        JSON.stringify(records)
    );


    console.log("Kayıt eklendi", records);

}
