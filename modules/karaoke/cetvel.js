console.log("CETVEL JS ÇALIŞTI");


const cetvel = document.getElementById("cetvel");
const tab = document.getElementById("cetvel-tab");


if(tab && cetvel){

    tab.onclick=function(){

        cetvel.classList.toggle("open");

        console.log("cetvel tıklandı");

    };

}



function updateCetvel(note){

    console.log("Gelen nota:",note);


    document.querySelectorAll(".pitch-note")
    .forEach(el=>{

        el.classList.remove("active");

    });



    let notes = {

        "do":"DO",
        "si":"Sİ",
        "la":"LA",
        "sol":"SOL",
        "fa":"FA",
        "mi":"Mİ",
        "re":"RE"

    };


    let target = notes[note];


    if(target){

        document.querySelectorAll(".pitch-note")
        .forEach(el=>{

            if(el.innerText.trim()==target){

                el.classList.add("active");

            }

        });

    }

}
