

const video = document.querySelector('video');
const ctx = canvas.getContext('2d');
console.log(ctx);

const loadAndUseBodyPix = async () => {

    //model config
    const modelConfig =
    {
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
  }
    
    //load model With Config
    const modelLoaded = await bodyPix.load(modelConfig);
    return modelLoaded
} 



// get the person out of the background 
const PersonSegmentation = async () => {
  console.log('entro');
    const net = await loadAndUseBodyPix()
    .then(response =>response)
    .catch(err => console.log(err));
    console.log(net);

    const configSegmentation = {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.7
    }

    setInterval(async () =>{
        await net.segmentPerson(video, configSegmentation)
        .then(response => {
            console.log(response);
          })
        .catch(err => console.log(err));

    }, 300);

  
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


startVideo();



video.addEventListener('loadeddata', () => {

    PersonSegmentation();  
})
