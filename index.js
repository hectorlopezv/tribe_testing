//variables
const video = document.getElementById('video');
const canvas = document.getElementById('output');
let net;

/*------VIDEOS RESOURCES -----*/
// Get available Devices of THE uSER
const getDevices = async () => {
  console.log('entro');
  //que el user agent sea compatible con mediaDevices
  if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alertPrompt();
   return [];
  }
  //ahora miramos si  que devices ofrece el USER
  //alertPrompt('Lo soporta');
  const devices = await navigator.mediaDevices.enumerateDevices();

  // Por ahora me interesa solo el video-Label-deviceId
  const VideoDevices = devices.filter( device  => device.kind === 'videoinput');
  console.log(VideoDevices);
  return VideoDevices

}
//stop any video playing before basically
const stopVideo = () => {
  //solo si srcObject esta definido borra sus tracks.... y exista el video element..
  if(video && video.srcObject)
  {
    console.log('papi');
    video.srcObject.getTracks().forEach(track => {
      track.stop();
    });
    video.srcObject = null;
  }
}

//load video configs
const setVideo = async () => {

  stopVideo(video);
  const config  = {
    audio: false, 
    video: true 
  };
  const stream = await navigator.mediaDevices.getUserMedia(config);
  video.srcObject = stream;

  //retornamos promesa para forzar que espere y retorne
  return PromiseCreator();
}

//ponemos el video con sus valores
const PromiseCreator = () => {
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      resolve(video);
    };
  });
}


async function loadVideo() {
  let state_video;
  try {
    state_video = await setVideo();
  } catch (e) {
     throw e;
  }
  //"comenzamos" el stream para que se carge y podamos a empezar a aplica prediciones
  state_video.play();
}
















/* --------- ML PART-------*/
async function loadModel(){
  const modelConfig = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 1,
    quantBytes: 2
  };

  net = await bodyPix.load(modelConfig);
  console.log(net);
  return net;

}

async function makePredictionPerson(){
  const prediction = await net.segmentPerson(video);
  console.log(prediction);
  return prediction; 
}



async function load () {
  console.log('hola');
  const videoElement = document.querySelector('video#video');
const net = await bodyPix.load();
const segmentation = await net.segmentPerson(videoElement);
}

async function execute() {

  await getDevices();
  
  await makePredictionPerson(await loadModel(await loadVideo()));

  //await stopVideo();

}

execute();












