

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
//import virtualBackground from './Effects/VirtualBackground.js';
import virtualBackground_ from './Effects/virtual.js';
import predictionBodyParts from './ModelSetup/predictionBodyPartsPerson.js';
import predictionBodyPartsMulti from './ModelSetup/predictionBodyPartsPersonMulti.js';
import blurBodyPart from './Effects/BlurBodyPart.js';
import canvasToImage from './Effects/canvasToImage.js';
import changeBodyPartImage from './Effects/changeBodyPartForImage.js';
import cpuBlur from './Effects/BlurImage.js';
import getImageData from './VideoSetup/GetImageData.js';
import videoImageData from './VideoSetup/GetVideoData.js';



//comprovacion si soporta y tiene video

if (getDevices() < 1){
    console.log('algun tipo de accion.')
}

//caragamos el singleton que tendra todo relevante

const tracker = new Tracker();

//lo que le pedimos al singleton
//Stream - captureStream fun -> return MediaStream Object, LoadVideo fun -> Stream Object, SetVideo , ask Permision from MediaDevices for video fun -> return Media stream Object
//clase Prediction - Segmentation Person / Segmentation MultiPerson funciones , LoadModel-> return loadedModel,  run-> return prediction /
//Config del Modelo -  JsonObject {arch: 'ResNet o MobileNet, outputStride:lower is better 8,16,32:, multiplier: higher better acurracy 1,0.75,0.50, quantBytes:1,2,4 higher is better, multiplier: 1,.75,.50 only mobile}
//AnimationFrame -> execute loop for canvas then use Capture stream to repaint the canvas
//getImagedata - GetVideoData
//Create img Tag
//atrr video.width == canvas.width, video.height == canvas.height



//Class Video_Tracking
class VideoTracking {
    constructor(width, height, model_config, config_constrains, config_prediction ){
        /*Dimensions of the input video width, height*/
        /* modelConfig = architecture: 'ResNet', 'mobileNetV1', outputStride: 8,16,32, multiplier: 1,0.75,0.50, quantBytes: 1,.75,.50 only mobile*/
        /* config_constrains = audio: audio_config, video: video_config*/
        /*config_prediction = flipHorizontal: true, internalResolution: 'high', segmentationThreshold: 0.7*/
        /*config_prediction (additional for MultiPerson) = maxDetections: 10,scoreThreshold: 0.2, nmsRadius: 20, minKeypointScore: 0.3, refineSteps: 10*/
        
        /*Permissions and SetUp Video*/
        
        //this.VideoElement = this.createVideo(); /*Video Element*/
        //this.videoStream = this.load_Video_stream(config_constrains);/*videoStream Media Stream*/
        //this.canvasElement = this.createCanvas(width, height);/*Create canvas to Write to setting some dimensions*/
        
        //this.model_config = model_config;
        //this.config_prediction = config_prediction;
        
        this.VideoElement = this.createVideo(); /*Video Element*/
        this.canvasElement = this.createCanvas(false, width, height);/*Create canvas to Write to setting some dimensions*/
        this.model =  this._load_model(model_config);/*Promise Containtng Model*/
        this.videoStream =  this.load_Video_stream(config_constrains);/*Promise Containing Video MediaStream*/
        this.predictionModel = new Prediction(config_prediction, this.model, this.videoStream, this.canvasElement);
    }

    
    static addVideo(HTMLelement, videoElement) {
        HTMLelement.appendChild(videoElement);
      }
    
    


    execute_effect_test(){

        const prediction = this.run_prediction(1);
        //async effect_blur_background(canvasElement, image, personSegmentation,  config){
        /*canvasElement where to draw the results*/
        /* config  = image--> imageData|HTMLimage|HTMLVideo, PersonSegmentation --> Prediction, edgeBlurAmount --> how many pixels to blur on the edge bettwen person and background, flipHorizontal --> flip image or not*/
        const config = {backgroundBlurAmount: 5, edgeBlurAmount: 5, flipHorizontal: false}
        this.prediction.effect_blur_background(this.canvasElement, this.videoElement, prediction, config);

        window.requestAnimationFrame(this.execute_effect_test);


    }
    

    load_canvas_test(){
        this.addVideo(document.querySelector('#main'), this.videoElement);
        const canvas_1 = createCanvas(true);
        this.addVideo(document.querySelector('#main'), canvas_1);
        const img_test = document.createElement('img'); // Use DOM HTMLImageElement
        img_test.src = './js_blur.jpg';
        img_test.alt = 'alt text';
        img_test.width = 640;
        img_test.height = 480;
    }

     _load_model(model_config){
        return  bodyPix.load(model_config);
    }



    async load_Video_stream(config_constrains){
        /* config_constrains = audio: audio_config, video: video_config*/
        /*Dimensions for video*/
        /*HTMLvideoElement*/
     
        const stream = await navigator.mediaDevices.getUserMedia(config_constrains);/*MediaStream Video*/
        this.VideoElement.srcObject = stream;/*SetVideo Stream Source*/ /*MediaStream Video*/
        this.video_stream = stream;

        //Retornamos promesa para forzar que espere y retorne
        return this.PromiseCreator();

        //return stream;/*Return Stream VideoElement*/
    }
    
    createVideo(){
        /*Create Video de donde sacaramos la informacion para hacer la prediccion y posteriormente dibujar el canvas*/
        const video = document.createElement('video');
        video.setAttribute('autoplay','false');
        //video.setAttribute('playsinline', 'false');
        //video.setAttribute('controls', 'false');
        //video.style.visibility = 'visible';
        video.style.display = 'none';
        return video;
    }

    createCanvas(option = false, width, height){
        /*Option --> True - False*/
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', '640');
        canvas.setAttribute('height', '480');
        if(option){/* True return canvas inside a DIV*/
          const container = document.createElement('div');
          container.classList.add('container');
          container.appendChild(canvas); //container > canvas
          canvas.setAttribute('autoplay','false');
          //canvas.setAttribute('playsinline', 'false');
          //canvas.setAttribute('controls', 'false');
          return container;
        }

        return canvas
      }
    


    PromiseCreator ()  { /* Return Promise VideoElement when all data is loaded and ready  with certains dimensions*/
        return new Promise((resolve, reject) => {
            this.VideoElement.onloadedmetadata = () => {
                this.VideoElement.width = this.VideoElement.videoWidth;
                this.VideoElement.height = this.VideoElement.videoHeight;
            resolve(this.VideoElement);
          };
        });
      }


}




//Class Prediction
class Prediction {
   /*config = flipHorizontal: true, internalResolution: 'high', segmentationThreshold: 0.7*/
   /*config (additional for MultiPerson) = maxDetections: 10,scoreThreshold: 0.2, nmsRadius: 20, minKeypointScore: 0.3, refineSteps: 10*/
   /* type_prediciton = String 'Person', 'MultiPerson'*/ 
    constructor(config, loaded_model, videoMediaStream, canvasElement){
        /*Common Parameters Person/MultiPerson*/
        this.flipHorizontal = config.flipHorizontal;
        this.internalResolution = config.internalResolution;
        this.segmentationThreshold = config.segmentationThreshold;
        this.loaded_model = loaded_model;/*Promise of Model*/
        this.videoMediaStream = videoMediaStream;
        this.canvasElement = canvasElement;

        /*MultiPerson Addditional Parameters*/
        this.maxDetections = config.maxDetections;
        this.scoreThreshold = config.scoreThreshold;
        this.nmsRadius = config.nmsRadius;
        this.minKeypointScore = config.minKeypointScore;
        this.refineSteps = config.refineSteps;


        this.stop = false;/*Stop Animation Loop*/
    }

    async make_prediction_load(){ /* Returns unit8Campled for every pixel in the Ho*Wo Element array 0: Backgrounnd : 1:Person*/
        /*type_prediciton 1 --> Person, 2 --> MultiPerson, 3 --> BodyParts Prediciton/
        /*HTMLVideoElement --> ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement*/
        let model_prediction;
        if (typeof this.loaded_video === 'undefined'){/* Load one time video MediaStream if was not loaded yet*/
            this.loaded_video = await this.videoMediaStream;
            this.model_prediction = await this.loaded_model;/*cargando el model*/
            //console.log(this.model_prediction);

            /*add video to HTML*/
            //VideoTracking.addVideo(document.querySelector('body'), this.loaded_video );// No es necesario anadir el HTML.... xd
            /*Strat Capturing Canvas*/
        }



    }

    request_canvas_MediaStream(fps){/*Give canvas Media stream */
        this.canvas_MediaStream = this.canvasElement.captureStream(fps);
        window.canvas_stream = this.canvas_MediaStream;
        return this.canvas_MediaStream;
    }




    async effect_blur_background(canvasElement, image, personSegmentation,  config){
        /*canvasElement where to draw the results*/
        /* config  = image--> imageData|HTMLimage|HTMLVideo, PersonSegmentation --> Prediction, edgeBlurAmount --> how many pixels to blur on the edge bettwen person and background, flipHorizontal --> flip image or not*/

        const {backgroundBlurAmount, edgeBlurAmount, flipHorizontal} = config; 
        await bodyPix.drawBokehEffect(canvasElement, image, personSegmentation, backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
    }


    async virtual_background(canvasElement, videoElement, personSegmentation,  config){
       
        await virtualBackground_(personSegmentation, canvasElement, videoElement, config);
    }


    stopAnimationLoop(){
        /*Working*/
        this.stop = true;
        return this.stop;
    }

    async loop_(type_prediciton, canvasElement, config){
        //effect_function, parameters_function
 
        const prediction = await this.make_prediction_load();
        const loaded_video = this.loaded_video;
        const model_prediction = this.model_prediction;

 
        /*
        else if (type_prediciton == 2){
            //*Opciones sacar datos de la imagen / mandar directamente el HTML tag
            const config = { flipHorizontal: this.flipHorizontal, internalResolution: this.internalResolution, segmentationThreshold: this.segmentationThreshold, 
                maxDetections: this.maxDetections, scoreThreshold: this.scoreThreshold, nmsRadius: this.nmsRadius, minKeypointScore: this.minKeypointScore, refineSteps: this.refineSteps}
            const prediction = await this.loaded_model.segmentMultiPerson(HTMLVideoElement, config);
            return prediction;
        }
        else
        {    //*Opciones sacar datos de la imagen / mandar directamente el HTML tag
            const config = { flipHorizontal: this.flipHorizontal, internalResolution: this.internalResolution, segmentationThreshold: this.segmentationThreshold}
            const prediction  = await this.loaded_model.segmentPersonParts(HTMLVideoElement, config);
            return prediction;

        }
        */

        /*Second*/
        VideoTracking.addVideo(document.querySelector('body'), canvasElement);// No es necesario anadir el HTML.... xd

     /*Animation Loop*/
     
     const loopping = async () =>{/*Loop for animation*/

        if (type_prediciton == 1){/*Blur Background*/
            /*Opciones sacar datos de la imagen / mandar directamente el HTML tag*/
            //const config = { flipHorizontal: this.flipHorizontal, internalResolution: this.internalResolution, segmentationThreshold: this.segmentationThreshold}
            
            
            const prediction_frame = await model_prediction.segmentPerson(loaded_video, config);
     
            this.effect_blur_background(canvasElement, this.loaded_video, prediction_frame,  config);
        }


        if(type_prediciton === 2){/*Virtual Background*/
            
            const prediction_frame = await model_prediction.segmentPerson(loaded_video, config);


            //this.effect_blur_background(canvasElement, this.loaded_video, prediction_frame,  config);
            //console.log(config);
            
            
            this.virtual_background(canvasElement, this.loaded_video, prediction_frame,  config);


        }



        if(this.stop){
            //console.log("acabo el loop");
            /*remove canvas If visible in the DOM*/
            canvasElement.remove();
            return;
        }
        window.requestAnimationFrame(loopping);


       }

     loopping();

    }

    
}

//Testing New Classes
//constructor(width, height, model_config, config_constrains, config_prediction )
/*Dimensions of the input video width, height*/
/* modelConfig = architecture: 'ResNet', 'mobileNetV1', outputStride: 8,16,32, multiplier: 1,0.75,0.50, quantBytes: 1,.75,.50 only mobile*/
/* config_constrains = audio: audio_config, video: video_config*/
/*config_prediction = flipHorizontal: true, internalResolution: 'high', segmentationThreshold: 0.7*/
/*config_prediction (additional for MultiPerson) = maxDetections: 10,scoreThreshold: 0.2, nmsRadius: 20, minKeypointScore: 0.3, refineSteps: 10*/
const model_config = { architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2}
const config_constrains = {audio: false, video: true}
const config_prediction = {  flipHorizontal: false, internalResolution: 'high', segmentationThreshold: 0.7}
const config_effect_bokek = {backgroundBlurAmount: 5, edgeBlurAmount: 5, flipHorizontal: false}

const config_virtual_background = {backgroundBlurAmount: 5, edgeBlurAmount: 5, flipHorizontal: false, URL: './js.jpg', width: 640, height:480};

const Tracking = new VideoTracking(640, 480, model_config, config_constrains, config_prediction);


//console.log(Tracking.model);
//console.log(Tracking.predictionModel);/* Run Prediciont with A then....*/


//Tracking.predictionModel.w
/*Implementando 1...PersonSementation, Blur Background */
//Tracking.predictionModel.loop_(1, Tracking.canvasElement,  config_effect_bokek, Tracking.VideoElement);
//const test = Tracking.predictionModel.request_canvas_MediaStream(25);

//Implementado 2... PersonSegmenttion, 
Tracking.predictionModel.loop_(2, Tracking.canvasElement,  config_virtual_background, Tracking.VideoElement);
//const test_2 = Tracking.predictionModel.request_canvas_MediaStream(25);

//console.log(test);
//Falta el Loop
//console.log(Tracking.predictionModel);

/*Stop Anmation Loop*/
//Tracking.predictionModel.stopAnimationLoop();





//const prediction = Tracking.run_prediction(1);
//console.log(prediction);


















//cargamos el modelo...
const architecture = 'MobileNetV1';
const outputStride = 16; 
const multiplier = 1;
const quantBytes = 4;
let img_test = 0;

document.querySelector('#btn').onclick = () => {
    for (let index = 0; index < 50; index++) {
        console.log('ESTA aqui')
        
    }
}

const load = async () =>
{
    try {
        
        tracker.net = await loadModel(architecture, outputStride, multiplier, quantBytes);// Classe prediction
    } catch (error) {
        console.log(error);
    }
    //Setup Del Video
    await loadVideo(createVideo(), tracker );//Stream Object


    //anadimos al algun elemento html
    addVideo(document.querySelector('#main'), tracker.video);
    tracker.canvas_1 = createCanvas(true);
    addVideo(document.querySelector('#main'), tracker.canvas_1);

    
    
    
    
    //const img_test = new Image();
    //img_test.crossOrigin = '';
    //await new Promise(r => img_test.onload=r, img_test.src='./js.jpg');
    execute();


}
//load();

async function execute() {
   
    //prediction Person
    await makePredictionPerson(tracker);
    
    
  
    //prediction BodyParts Person
    //await predictionBodyParts(tracker);

    //blur Body parts
    //await blurBodyPart(tracker, [10, 11, 13, 12,2,3,4,5], 20, 5);
    
    //Blur Effect
    //await blurBackground(tracker.canvas_1.firstChild, tracker.video, tracker.prediction, 18, 15,true);YA
    
    //GrayScale -- Pixel manipulation
    //grayScale(tracker);
    
    //background manipulation
    //const URL = './js.jpg';
    //await virtualBackground(URL, tracker.video.width, tracker.video.height, tracker, true);

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
     
    
    
    //window.requestAnimationFrame(execute)
}

























