
async function startCetvel(){
 const stream=await navigator.mediaDevices.getUserMedia({audio:true});
 console.log("VOCALY mikrofon aktif",stream);
}
