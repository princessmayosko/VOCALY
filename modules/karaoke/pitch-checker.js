console.log("PITCH CHECKER ÇALIŞTI");


let currentTargetNotes = [];


// Aktif kelimenin notalarını al

function setTargetNotes(noteString){

    if(!noteString){

        currentTargetNotes=[];

        return;

    }


    currentTargetNotes =
    noteString
    .split(" ")
    .map(n=>normalizeNote(n));


}




// Oktav kaldırma

function normalizeNote(note){

    return note
    .replace(/[0-9]/g,"")
    .toLowerCase();

}





// Gelen notayı kontrol et

function checkPitch(note){


    if(!currentTargetNotes.length){

        return false;

    }



    let clean =
    normalizeNote(note);



    return currentTargetNotes.includes(clean);


}
