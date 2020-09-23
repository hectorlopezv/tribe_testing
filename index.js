// get video tag
const video = document.getElementById('video');


//start video and hoook video to tag
//ask permission  for mic an video 



const checkInputDevices = () => {
  var enumeratorPromise = navigator.mediaDevices.enumerateDevices()
  .then(response => {
    response.forEach(device => {
      console.log(device);
      console.log(device.kind);
    })
    
  })
  .catch(error => console.log(error));
}
const startVideoo = () => {

  const constraints = { audio: true, video: true };
  navigator.mediaDevices.getUserMedia(constraints)
  .then(stream =>  {
    /* use the stream */
    console.log('entro aqui');
    window.stream = stream; // make variable available to browser console
    video.srcObject = stream; // hacemos que salga el stream
  })
  .catch(error => console.log(error));

}
checkInputDevices();
startVideoo(); //