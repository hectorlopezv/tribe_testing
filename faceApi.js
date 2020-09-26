// get video tag
const video = document.getElementById('video');
const elem = document.documentElement;
const container = document.querySelector('.container'); 
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


const startVideo = async () => {

  const constraints = { 
    audio: {
      echoCancellation: true, 
      noiseSuppression: true, 
      sampleRate: 44100 }, 
      video: true };
  await navigator.mediaDevices.getUserMedia(constraints)
  .then(stream =>  {
    /* use the stream */
    //var echoCancellation = MediaTrackSettings.echoCancellation;
    //console.log(echoCancellation);
    //console.log('entro aqui');
    window.stream = stream; // make variable available to browser console
    video.srcObject = stream; // hacemos que salga el stream
  })
  .catch(error => console.log(error));

}

const supportedConstrains = () => {
  var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  console.log(supportedConstraints);
}


const btn = document.querySelector('#button');
/*
btn.addEventListener('click', () =>{
  const element = document.documentElement;
    if(element.requestFullscreen) {
    element.requestFullscreen();        // W3C spec
  }
  else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();     // Firefox
  }
  else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();  // Safari
  }
  else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();      // IE/Edge
  }
})
*/
const screenCapture = async () => {
  const constraints = { audio: {echoCancellation: true, noiseSuppression: true}, video: true };

  await navigator.mediaDevices.getDisplayMedia(constraints)
  .then(stream => {
    window.stream = stream;
    video.srcObject = stream;
    //document.requestFullscreen();
    document.querySelector('html').requestFullscreen();
    
  })
  .catch(error => console.log(error));
}




//check for support constraints
supportedConstrains();


//check input devices
checkInputDevices();

//start recording
startVideo(); //


//screen capture
//screenCapture();

//use face api for detectig faces in the browser
//load in parraller all promises
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models')

]);


video.addEventListener('play', () => {
   const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width-10, height: video.height-15 }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections); 
    
    
    // draw api_docs
    faceapi.draw.drawDetections(canvas, resizedDetections);
    //drwa lines
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    //draw expressions (sentiment);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    //age estimation
    //faceapi.draw.drawAgeAndGender(canvas, resizedDetections);

  }, 100);
})




