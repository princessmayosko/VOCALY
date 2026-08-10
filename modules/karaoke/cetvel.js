console.log("CETVEL JS ÇALIŞTI");


const cetvel = document.getElementById("cetvel");
const cetvelTab = document.getElementById("cetvel-tab");


if(cetvelTab && cetvel){


    cetvelTab.addEventListener("click",()=>{

        cetvel.classList.toggle("open");

        console.log("cetvel tıklandı");

    });


}





function updateCetvel(note){


    console.log("Cetvel nota:",note);


    if(!note) return;


    let marker =
    document.getElementById("pitch-marker");


    if(!marker) return;



    let temiz =
    note
    .replace(/[0-9]/g,"")
    .toLowerCase();



    const notes=[

        "do",
        "do#",
        "re",
        "re#",
        "mi",
        "fa",
        "fa#",
        "sol",
        "sol#",
        "la",
        "la#",
        "si"

    ];



    let index =
    notes.indexOf(temiz);



    if(index<0) return;



    let panel =
    document.getElementById("pitch-panel");



    let h =
    panel.clientHeight-40;



    let y =
    (index/11)*h;



    marker.style.top =
    (h-y)+"px";



    let result =
    document.getElementById("pitch-result");


    if(result){

        result.innerHTML =
        temiz.toUpperCase();

    }


}
