let library = [];
let current = null;
let audio = document.getElementById("audio");
let timer = null;


// Kütüphane yükle
fetch("../../data/library.json")
.then(r => r.json())
.then(d => {

    library = d;
    renderLibrary();

})
.catch(err => {
    console.error("Library yüklenemedi:", err);
});



// Şarkı listesini oluştur
function renderLibrary(){

    const box = document.getElementById("songs");
    box.innerHTML = "";


    library.forEach((s,i)=>{


        let div = document.createElement("div");
        div.className = "card";


        div.innerHTML = `
            <div class="song-title">
                🎵 ${s.title}
            </div>

            <div class="song-info">
                VOCALY Karaoke
            </div>

            <button>Aç</button>
        `;


        div.querySelector("button").onclick = function(e){

            e.stopPropagation();

            openSong(i);

        };


        box.appendChild(div);


    });

}




// Şarkıyı aç
async function openSong(i){


    current = library[i];


    document.getElementById("library")
    .classList.add("hidden");


    document.getElementById("karaoke")
    .classList.remove("hidden");



    document.getElementById("title")
    .innerHTML = current.title;



    // müzik
    audio.src = "../../" + current.audio;



    try{


        let response = await fetch("../../" + current.json);

        let data = await response.json();


        current.segments = data.heceler || [];


        renderWords();



    }catch(e){

        console.error("JSON yüklenemedi:",e);

        current.segments=[];

    }


}




// Sözleri oluştur
function renderWords(){


    let box = document.getElementById("words");

    box.innerHTML="";


    if(!current || !current.segments){

        return;

    }



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


            w.innerText=x.text;



            row.appendChild(w);



        });



        box.appendChild(row);



    });



}




// Çal
function playSong(){


    if(!current) return;


    audio.play();



    if(timer) clearInterval(timer);



    timer=setInterval(()=>{


        let t=audio.currentTime;



        current.segments.forEach((x,i)=>{


            let el=document.querySelector(`[data-i="${i}"]`);



            if(el && t>=x.start && t<=x.end){


                el.classList.add("active");


            }
            else if(el){


                el.classList.remove("active");


            }


        });



    },100);



}




// Durdur
function stopSong(){


    audio.pause();


    if(timer){

        clearInterval(timer);

    }


}




// Baştan
function resetSong(){


    audio.currentTime=0;


}




// Listeye dön
function backLibrary(){


    stopSong();


    document.getElementById("karaoke")
    .classList.add("hidden");


    document.getElementById("library")
    .classList.remove("hidden");


}
