import getDevices from '/VideoSetup/GetDevices.js';
import loadModel from '/ModelSetup/loadModel.js';
import Tracker from './Singleton/Singleton.js';
import createVideo  from './VideoSetup/CreateVideo.js';
import setVideo, {addVideo } from './VideoSetup/Setup.js';
import makePredictionPerson from './ModelSetup/prediction.js';
import blurBackground from './Effects/BlurBackgrond.js';
import createCanvas from './VideoSetup/CreateCanvas.js';
import loadVideo from './VideoSetup/Load.js';
import grayScale from './Effects/GrayScale.js';
import virtualBackground from './Effects/VirtualBackground.js';
import predictionBodyParts from './ModelSetup/predictionBodyPartsPerson.js';
import predictionBodyPartsMulti from './ModelSetup/predictionBodyPartsPersonMulti.js';
import blurBodyPart from './Effects/BlurBodyPart.js';
import canvasToImage from './Effects/canvasToImage.js';
import changeBodyPartImage from './Effects/changeBodyPartForImage.js';
import cpuBlur from './Effects/BlurImage.js';
import getImageData from './VideoSetup/GetImageData.js';
import videoImageData from './VideoSetup/GetVideoData.js';
//variables
const video = document.getElementById('video');


//comprovacion si soporta y tiene video
if (getDevices() < 1){
    console.log('algun tipo de accion.')
}
//caragamos el singleton que tendra todo relevante
const tracker = new Tracker();

//cargamos el modelo...
const architecture = 'MobileNetV1';
const outputStride = 16; 
const multiplier = 0.75;
const quantBytes = 2;
let img_test = 0;
const load = async () =>
{
    try {
        
        tracker.net = await loadModel(architecture, outputStride, multiplier, quantBytes);
    } catch (error) {
        console.log(error);
    }
    //Setup Del Video
    await loadVideo(createVideo(), tracker );


    //anadimos al algun elemento html
    addVideo(document.querySelector('#main'), tracker.video);
    tracker.canvas_1 = createCanvas(true);
    addVideo(document.querySelector('#main'), tracker.canvas_1);
    img_test = document.createElement('img'); // Use DOM HTMLImageElement
    img_test.src = './js_blur.jpg';
    img_test.alt = 'alt text';
    img_test.width = 640;
    img_test.height = 480;
    
    
    
    
    //const img_test = new Image();
    //img_test.crossOrigin = '';
    //await new Promise(r => img_test.onload=r, img_test.src='./js.jpg');
    execute();


}
load();




async function execute() {
   
    //prediction Person
    await makePredictionPerson(tracker);
    
    
  
    //prediction BodyParts Person
    //await predictionBodyParts(tracker);

    //blur Body parts
    //await blurBodyPart(tracker, [10, 11, 13, 12,2,3,4,5], 20, 5);
    
    //Blur Effect
    //await blurBackground(tracker.canvas_1.firstChild, tracker.video, tracker.prediction, 18, 15,true);
    
    //GrayScale -- Pixel manipulation
    //grayScale(tracker);
    
    //background manipulation
    const URL = './js.jpg';
    await virtualBackground(URL, tracker.video.width, tracker.video.height, tracker, true);

    //Canvas To Image(donwload) -- type, quality0-1, nameFile, canvas
    //canvasToImage('image/jpeg', 1, 'hector', tracker.canvas_1.firstChild);

    //change body part for a Background
    //changeBodyPartImage(tracker, tracker.canvas_1.firstChild.width, 
    //tracker.canvas_1.firstChild.height, URL, true);


    //Blur image

   /*
    cpuBlur(tracker.canvas_1.firstChild, img_test, 10);
    //canvasToImage('image/jpeg', 1, 'hector', tracker.canvas_1.firstChild);
        const maskBackground = true;
    // Convert the segmentation into a mask to darken the background.
    const foregroundColor = {r: 0, g: 0, b: 0, a: 255};
    const backgroundColor = {r: 0, g: 0, b: 0, a: 0};
    const mask = bodyPix.toMask(
        tracker.prediction, foregroundColor, backgroundColor);
    //console.log(backgroundDarkeningMask);
    //hagamole blur al MASK
    //const mask_blured = createCanvas(false);
    const mask_canvas = document.createElement('canvas');
    mask_canvas.setAttribute('width', '640');
    mask_canvas.setAttribute('height', '480');

    const mask_canvas_blur = document.createElement('canvas');
    mask_canvas_blur.setAttribute('width', '640');
    mask_canvas_blur.setAttribute('height', '480');
    


    //console.log(mask_blured);
    const mask_canvas_context = mask_canvas.getContext('2d');
    mask_canvas_context.putImageData(mask, 0, 0);
    
    const mask_canvas_blur_context = mask_canvas_blur.getContext('2d');
    
    //console.log(mask_blurred_completed);



    document.querySelector('#blur').getContext('2d').clearRect(0, 0, 640, 480);
    document.querySelector('#blur_2').getContext('2d').clearRect(0, 0, 640, 480);
    //mask_canvas_context.save();
    
    const blur_1 = document.querySelector('#blur');
    const blur_2 = document.querySelector('#blur_2');
    const resu_mask_blur_canvas = await cpuBlur(blur_1, mask_canvas, 70);
    const resu_mask_blur_imageData = resu_mask_blur_canvas.getContext('2d').getImageData(0,0,640,480);
    //console.log(resu_mask_blur_imageData);

    //replace black pixels to the ones in the video tag
    const { data: videoData } = videoImageData(1,tracker.video.width, tracker.video.height);
    const {data:map} =  resu_mask_blur_imageData;
    const pixelLength = map.length;


    //Getimage Data
   
    //blank canvas 
    const newImg = blur_2.getContext('2d').createImageData(640, 480);
    const newImgData = newImg.data;

    //console.log(map)
    for (let i = 0; i < pixelLength; i++) 
    {
        if (map[i] == 255){
            newImgData[i] = videoData[i];
            newImgData[i+1] = videoData[i+1];
            newImgData[i+2] = videoData[i+2];
            newImgData[i+3] = videoData[i+3];
        }

    }

    const opacity = 1;
    const maskBlurAmount = 0;
    const flipHorizontal = false;
    
   
    // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
    // maskBlurAmount set to 3, this will darken the background and blur the
    // darkened background's edge.
    bodyPix.drawMask(
        document.querySelector('#blur_2'), img_test, 
        newImg, opacity, maskBlurAmount, flipHorizontal);

        */
     
    
    
    window.requestAnimationFrame(execute)
}























