
let library=[];
let current=null;
let audio=document.getElementById('audio');
let timer=null;

fetch('../../data/library.json')
.then(r=>r.json())
.then(d=>{
 library=d;
 renderLibrary();
});

function renderLibrary(){
 const box=document.getElementById('songs');
 box.innerHTML="";

 library.forEach((s,i)=>{

   let div=document.createElement('div');
   div.className="card";

   div.innerHTML=`
      <div style="font-size:20px;font-weight:bold">
        🎵 ${s.title}
      </div>

      <div style="opacity:.7;margin-top:8px">
        VOCALY Karaoke
      </div>

      <button style="margin-top:12px">
        Aç
      </button>
   `;

   div.querySelector("button").onclick=(e)=>{
    e.stopPropagation();
    openSong(i);
};

   box.appendChild(div);

 });
}

async function openSong(i){

 current = library[i];

 document.getElementById('library').classList.add('hidden');
 document.getElementById('karaoke').classList.remove('hidden');

 document.getElementById('title').innerHTML = current.title;

 audio.src = "../../" + current.audio;

 let response = await fetch("../../" + current.json);
 let data = await response.json();

 current.segments = data.heceler || [];

 renderWords();
}
function renderWords(){
 let box=document.getElementById('words');
 box.innerHTML="";
let lines={};
}

current.segments.forEach(x=>{

   if(!lines[x.line]){
      lines[x.line]=[];
   }

   lines[x.line].push(x);

});


Object.values(lines).forEach(line=>{

   let row=document.createElement("div");
   row.className="lyric-line";


   line.forEach(x=>{

      let w=document.createElement("span");

      w.className="word";
      w.innerText=x.text;

      row.appendChild(w);

   });


   box.appendChild(row);

});

function playSong(){
 audio.play();
 timer=setInterval(()=>{
   let t=audio.currentTime;
   current.segments.forEach((x,i)=>{
    let el=document.querySelector(`[data-i="${i}"]`);
    if(el && t>=x.start && t<=x.end)
       el.classList.add('active');
    else if(el) el.classList.remove('active');
   });
 },100);
}

function stopSong(){
 audio.pause();
}

function resetSong(){
 audio.currentTime=0;
}

function backLibrary(){
 audio.pause();
 document.getElementById('karaoke').classList.add('hidden');
 document.getElementById('library').classList.remove('hidden');
}
