console.log("YENİ KARAOKE JS ÇALIŞTI");


let library=[];
let current=null;
let audio=document.getElementById("audio");
let timer=null;



// KÜTÜPHANE

fetch("../../data/library.json")
.then(r=>r.json())
.then(d=>{

    library=d;

    renderLibrary();

})
.catch(e=>console.error(e));





function renderLibrary(){

    let box=document.getElementById("songs");

    box.innerHTML="";


    library.forEach((s,i)=>{


        let div=document.createElement("div");

        div.className="card";


        div.innerHTML=`

        <div class="song-title">
        🎵 ${s.title}
        </div>

        <div class="song-info">
        VOCALY Karaoke
        </div>

        <button>Aç</button>

        `;



        div.querySelector("button").onclick=(e)=>{

            e.stopPropagation();

            openSong(i);

        };


        box.appendChild(div);


    });


}







// ŞARKI AÇ

async function openSong(i){


    current=library[i];


    document.getElementById("library")
    .classList.add("hidden");


    document.getElementById("karaoke")
    .classList.remove("hidden");



    document.getElementById("title")
    .innerHTML=current.title;



    audio.src="../../"+current.audio;



    try{


        let response=
        await fetch("../../"+current.json);


        let data=
        await response.json();



        current.segments=data.heceler || [];


        renderWords();



    }

    catch(e){

        console.error(
        "JSON yükleme hatası",
        e
        );

    }


}









// SÖZLERİ OLUŞTUR

function renderWords(){


    let box=document.getElementById("words");


    box.innerHTML="";



    let lines={};



    current.segments.forEach((x,i)=>{


        if(!lines[x.line]){

            lines[x.line]=[];

        }


        lines[x.line].push({

            ...x,

            index:i

        });


    });





    Object.values(lines).forEach(line=>{


        let row=document.createElement("div");


        row.className="lyric-line";



        line.forEach(x=>{


            let w=document.createElement("span");


            w.className="word";


            w.dataset.i=x.index;

            w.dataset.start=x.start;

            w.dataset.end=x.end;



            w.innerHTML=

            `
            <div class="fill"></div>
            <span>${x.text}</span>
            `;



            row.appendChild(w);


        });



        box.appendChild(row);


    });


}











// ÇALMA

function playSong(){

    if(!current) return;


    // mikrofonu aç
    if(typeof startPitch === "function"){
        startPitch();
    }


    audio.play();


    if(timer){
        clearInterval(timer);
    }


    timer=setInterval(()=>{


        let t=audio.currentTime;



        document.querySelectorAll(".word")

        .forEach(el=>{


            let start=parseFloat(el.dataset.start);

            let end=parseFloat(el.dataset.end);



            if(isNaN(start) || isNaN(end))
            return;





            if(t>=start && t<=end){



                let progress=

                Math.min(

                    100,

                    ((t-start)/(end-start))*100

                );



                el.style.setProperty(

                "--progress",

                progress+"%"

                );



                el.classList.add("active");

            }



            else if(t>end){



                el.style.setProperty(

                "--progress",

                "100%"

                );



                el.classList.remove("active");

                el.classList.add("done");


            }



        });



    },50);



}








function stopSong(){


    audio.pause();


    if(timer){

        clearInterval(timer);

    }

}







function resetSong(){


    audio.currentTime=0;


    document.querySelectorAll(".word")

    .forEach(el=>{


        el.style.setProperty(

        "--progress",

        "0%"

        );


        el.classList.remove("active");

        el.classList.remove("done");


    });


}






function backLibrary(){


    stopSong();


    document.getElementById("karaoke")

    .classList.add("hidden");


    document.getElementById("library")

    .classList.remove("hidden");


}
