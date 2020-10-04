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
    
    execute();


}
load();




async function execute() {
   
    //prediction Person
    //await makePredictionPerson(tracker);
    
    //prediction BodyParts Person
    await predictionBodyParts(tracker);

    //blur Body parts
    //await blurBodyPart(tracker, [10, 11, 13, 12,2,3,4,5], 20, 5);
    
    //Blur Effect
    //await blurBackground(tracker.canvas_1.firstChild, tracker.video, tracker.prediction, 18, 15,true);
    
    //GrayScale -- Pixel manipulation
    //grayScale(tracker);
    
    //background manipulation
    const URL = './js.jpg';
    //await virtualBackground(URL, tracker.video.width, tracker.video.height, tracker, true);

    //Canvas To Image(donwload) -- type, quality0-1, nameFile, canvas
    //canvasToImage('image/jpeg', 1, 'hector', tracker.canvas_1.firstChild);

    //change body part for a Background
    changeBodyPartImage(tracker, tracker.canvas_1.firstChild.width, 
        tracker.canvas_1.firstChild.height, URL, true);




    
    
    
    window.requestAnimationFrame(execute)
}























