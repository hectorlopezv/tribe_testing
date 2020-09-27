//variables
const video = document.getElementById('video');
const canvas_main = document.getElementById('output');
const foreground = {
  r: 0,
  g: 0,
  b: 0,
  a: 0
}

const background = {
  r: 0,
  g: 0,
  b: 0,
  a: 255
}
const foregroundIds = [1]
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

  //si no retornar error si no tiene
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
      canvas_main.width = video.videoWidth;
      canvas_main.height = video.videoHeight;
      
     
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
    multiplier: .75,
    quantBytes: 2
  };

  net = await bodyPix.load(modelConfig);
  console.log(net);
  return net;

}


async function blurRealBackground() {
  //podemos hacer como un slider aqui con estos 2 parametros
  const backgroundBlurAmount = 11;
  const edgeBlurAmount = 7;
  const flipHorizontal = false;
  
  // Draw the image with the background blurred onto the canvas. The edge between
  // the person and blurred background is blurred by 3 pixels.
  bodyPix.drawBokehEffect(
      canvas, video, prediction, backgroundBlurAmount,
      edgeBlurAmount, true);
}

//creamos un canvas.. para el elemento del video para el background
function createCanvas(){
  const canvas = document.createElement('canvas');
  return canvas
}

function drawStroke(bytes, row, column, width,radius) {
for (let i = -radius; i <= radius; i++) {
  for (let j = -radius; j <= radius; j++) {
    if (i !== 0 && j !== 0) {
      const n = (row + i) * width + (column + j);
      bytes[4 * n + 0] = color.r;
      bytes[4 * n + 1] = color.g;
      bytes[4 * n + 2] = color.b;
      bytes[4 * n + 3] = color.a;
    }
  }
}
}

function isSegmentationBoundary(segmentationData, row, column, width, radius){
let numberBackgroundPixels = 0;
for (let i = -radius; i <= radius; i++) {
  for (let j = -radius; j <= radius; j++) {
    if (i !== 0 && j !== 0) {
      const n = (row + i) * width + (column + j);
      if (!foregroundIds.some(id => id === segmentationData[n])) {
        numberBackgroundPixels += 1;
      }
    }
  }
}
return numberBackgroundPixels > 0;
}


function blurBackground(){
  const canvas_new = createCanvas();
    //if no blur return the same canvas withe the image
  //else blur all the image with the desired blur ctx effect

  //resize canvas to video
  const {height, width} =  video;
  canvas_new.height = height;
  canvas_new.width = width;
  //get context 2d
  const ctx = canvas_new.getContext('2d');
  //limpiamos el canvas por si
  ctx.clearRect(0, 0, width, height);
  //gurdamos el estado.. como estado pila
  ctx.save();
  //pintar en el canvas dependiendo de la condicion
  ctx.filter = 'blur(5px)';
  ctx.drawImage(video, 0, 0, width, height)
  //
  ctx.restore();
  //canvas_main.getContext('2d').drawImage(canvas_new, 0, 0, width, height);
  
  return canvas_new
}

function personMask(){
  const canvas_new = createCanvas();
  const ctx = canvas_new.getContext('2d');
  
  const {height, width} = video;
  canvas_new.height = height;
  canvas_new.width = width;

  canvas_new.getContext('2d').clearRect(0, 0, width, height);
  canvas_new.getContext('2d').drawImage(video, 0, 0, video.width, video.height);
  ctx.save();
  const imageData = canvas_new.getContext('2d').getImageData(0, 0, video.width, video.height);
  const pixel = imageData.data;

  for (var p = 0; p<pixel.length; p+=4)
  {
      if (prediction.data[p/4] == 0) {
          pixel[p+3] = 0;
      }
  }

  canvas_new.getContext('2d').imageSmoothingEnabled = true;
  canvas_new.getContext('2d').putImageData(imageData,0,0);
  ctx.restore();
  return  canvas_new
}


async function blur_test(){

  const blurVideo = blurBackground();

  //get context of main_canvas
  const ctx = canvas_main.getContext('2d');
  ctx.drawImage(blurVideo, 0, 0);

  const person = personMask();
  //console.log(person);
  //ctx.clearRect(0, 0, person.width, person.height);
  ctx.drawImage(person, 0, 0);
  //ahora neceistamos sacar a la persona del background

  
  



//drawWithCompositing(ctx, personMask, 'destination-in');
//drawWithCompositing(ctx, blurredImage, 'destination-over');

}



function drawWithCompositing(ctx, image,compositOperation) {
  ctx.globalCompositeOperation = compositOperation;
  ctx.drawImage(image, 0, 0);
}

function sacar_persona(){
  //creamos array vacio para la mask
  //rgb A
  const {width, height} = prediction;
  const bytes = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < height; i += 1) {
    for (let j = 0; j < width; j += 1) {
      const n = i * width + j;
      bytes[4 * n + 0] = background.r;
      bytes[4 * n + 1] = background.g;
      bytes[4 * n + 2] = background.b;
      bytes[4 * n + 3] = background.a;
      for (let k = 0; k < prediction.length; k++) {
        if (foregroundIds.some(
                id => id === prediction[k].data[n])) {
          bytes[4 * n] = foreground.r;
          bytes[4 * n + 1] = foreground.g;
          bytes[4 * n + 2] = foreground.b;
          bytes[4 * n + 3] = foreground.a;
          const isBoundary = isSegmentationBoundary(
              prediction[k].data, i, j, width,
              foregroundIds);
          if (drawContour && i - 1 >= 0 && i + 1 < height && j - 1 >= 0 &&
              j + 1 < width && isBoundary) {
            drawStroke(bytes, i, j, width, 1);
          }
        }
      }
    }
  }

  return new ImageData(bytes, width, height);

}









//el perreo
async function makePredictionPerson(){
  const config = {
    flipHorizontal: true,
    internalResolution: 'full',
    segmentationThreshold: 0.88
  }
  prediction = await net.segmentPerson(video, config);
  //console.log(prediction);
  return prediction; 
}



async function maskEffect (prediction) {
  //consists of 0 and 1
  //1 where the person is 0 the background
  const maskBackground = true;
  // Convert the segmentation into a mask to darken the background.
  const foregroundColor = {r: 0, g: 0, b: 0, a: 0};//the human part
  const backgroundColor = {r: 0, g: 0, b: 0, a: 0};//the background part
  const mask = await bodyPix.toMask(prediction, foregroundColor, backgroundColor);
  return mask;

}

//remove background...
async function removeBackground(){
  const context = canvas.getContext('2d');
  const camera = video
  context.drawImage(camera, 0, 0, camera.width, camera.height);
  var imageData = context.getImageData(0,0, camera.width, camera.height);
  var pixel = imageData.data;//los pixeles de la imagen
  for (var p = 0; p<pixel.length; p += 4)
  {
    if (prediction.data[p/4] == 0) {
        pixel[p+3] = 0;// la matrix es de RGB A la idea es poner la transparencia en 0
    }
  }
  context.imageSmoothingEnabled = true;
  context.putImageData(imageData,0,0);

}





async function drawMaskVirtualBackground(){
    //Effect to call
    const opacity = 1;
    const maskBlurAmount = 4;
    const flipHorizontal = false;
    //console.log(prediction);
    const mask = await maskEffect(prediction);

    
    //put background image
    canvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height);
    
    const imageData= canvas.getContext('2d').getImageData(0, 0, video.width, video.height);
    const pixel = imageData.data;

    for (var p = 0; p<pixel.length; p+=4)
    {
        if (prediction.data[p/4] == 0) {
            pixel[p+3] = 0;
        }
    }
    
    canvas.getContext('2d').imageSmoothingEnabled = true;
    canvas.getContext('2d').putImageData(imageData,0,0);
}

async function clearCanvas(){
  const context = canvas.getContext('2d');
  await context.clearRect(0, 0, canvas.width, canvas.height);
}


let net;
let prediction;
async function execute() {

await getDevices();//good mira devices disponibles
await loadVideo();//good carga el video

await loadModel();//carga el modelo pertinente


//hacemos el loop 1-hace prediccion , 2-limpiar el canvas 3-colorear el canvas 4- repetir
setInterval(async ()=> {
  //console.log('positivo');
  await makePredictionPerson();
  //await clearCanvas();
  
  //para el background virtual
  //await drawMaskVirtualBackground();

  //blur para el background real
  //await blurRealBackground();
   blur_test();
},200)


  //await drawMask(await makePredictionPerson(await loadModel(await loadVideo()))) ;

  //await stopVideo();
  

}

execute();












