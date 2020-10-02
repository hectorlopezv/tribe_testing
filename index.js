import getDevices from '/VideoSetup/GetDevices.js';
import loadModel from '/ModelSetup/loadModel.js';
import Tracker from './Singleton/Singleton.js';
import createVideo  from './VideoSetup/CreateVideo.js';
import setVideo, {addVideo } from './VideoSetup/Setup.js';
import makePredictionPerson from './ModelSetup/prediction.js';
import blurBackground from './Effects/BlurBackgrond.js';
import createCanvas from './VideoSetup/CreateCanvas.js';

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
const execute = async () => {
    try {
        tracker.net = await loadModel(architecture, outputStride, multiplier, quantBytes);
        console.log(tracker.net);
    } catch (error) {
        console.log(error);
    }
    //Setup Del Video
    tracker.video = await setVideo(createVideo() );


    //anadimos al algun elemento html
    addVideo(document.querySelector('#main'), tracker.video);
    tracker.canvas_1 = createCanvas(true);
    addVideo(document.querySelector('#main'), tracker.canvas_1);

    setInterval(async () => {
        tracker.prediction = await makePredictionPerson(tracker);
        const{data:map} = tracker.prediction;
        tracker.map = tracker.prediction.data
        //anadimos al html
        bodyPix.drawBokehEffect(tracker.canvas_1.firstChild, tracker.video, tracker.prediction, 17, 3, false);
    },1000/60);

}

execute();



















