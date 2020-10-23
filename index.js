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
            /*add video to HTML*/
            VideoTracking.addVideo(document.querySelector('body'), this.loaded_video );// No es necesario anadir el HTML.... xd
        }
    }

    request_canvas_MediaStream(fps){/*Give canvas Media stream */
        this.canvas_MediaStream = this.canvasElement.captureStream(fps);
        window.canvas_stream = this.canvas_MediaStream;
        return this.canvas_MediaStream;
    }

    
    async virtualBackground_(prediction, canvasElement, videoElement, config){
        const {URL, width, height} = config;
        //new canvas
        const canvas = canvasElement;//cremaos un blank array para llenarlo
        const newImg = canvas.getContext('2d').createImageData(width, height);//create blank new ImageData
        const newImgData = newImg.data;

        //prediction
        const {data:map} = prediction;
        const pixelLength = map.length;
        
        //Video Data
        const { data: videoData } = await this.videoImageData(width, height, videoElement);
    
        //imageData
        const {data: imgData} = await this.getImageData(width, height, URL);

        //es los pixels de no persona dibujar La imagen en si
        for (let i = 0; i < pixelLength; i++) {
            //los pixels de la imagen si es no es persona
            const [r, g, b, a] = [imgData[i*4], imgData[i*4 + 1], imgData[i*4 + 2], imgData[i*4 + 3]];

            //revisamos que sea 1 persona , 0 otra cosa
            [
                newImgData[i*4], 
                newImgData[i*4 +1],
                newImgData[i*4 + 2], 
                newImgData[i*4 + 3]
            ] = !map[i]   ? [r, g, b, 255] : [
                                            videoData[i*4], 
                                            videoData[i*4 +1], 
                                            videoData[i*4 + 2], 
                                            0]
        }
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        const {  backgroundBlurAmount, edgeBlurAmount, flipHorizontal } = config;
        bodyPix.drawMask(canvas, videoElement, newImg, backgroundBlurAmount, edgeBlurAmount, flipHorizontal);    
    }




    async videoImageData (width, height, videoElement){
        /*Create Canvas*/
        
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        
        /*Write data To image*/
        const context = canvas.getContext('2d');
        const img = videoElement;
        
        context.drawImage(img, 0, 0 );
        var theData = context.getImageData(0, 0, width, height);
        return theData;
    }


    async getImageData(width, height, URL){
        
        //create Image object
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        /*create new image*/
        const img = new Image();
        img.crossOrigin = '';
        await new Promise(r => img.onload=r, img.src=URL);
        
        //resize image to canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, img.width, img.height, //source rectangle
                            0,0, width, height);//destination rectangle
        return ctx.getImageData(0, 0, width, height);   
    }

    async effect_blur_background(canvasElement, image, personSegmentation,  config){
        /*canvasElement where to draw the results*/
        /* config  = image--> imageData|HTMLimage|HTMLVideo, PersonSegmentation --> Prediction, edgeBlurAmount --> how many pixels to blur on the edge bettwen person and background, flipHorizontal --> flip image or not*/

        const {backgroundBlurAmount, edgeBlurAmount, flipHorizontal} = config; 
        await bodyPix.drawBokehEffect(canvasElement, image, personSegmentation, backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
    }

    async virtual_background(canvasElement, videoElement, personSegmentation,  config){
        await this.virtualBackground_(personSegmentation, canvasElement, videoElement, config);
    }

     async blurBodyPart_(canvasElement, videoElement, personSegmentationParts,  config ) {

        /*Reference of Body Parts*/
        const parts = {
            'left_face':0, 	
            'torso_front': 12,
            'right_face':1,
            'torso_back':13,
            'left_upper_arm_front':2,
            'left_upper_leg_front':14,
            'left_upper_arm_back':3,
            'left_upper_leg_back':15,
            'right_upper_arm_front': 4,
            'right_upper_leg_front':16,
            'right_upper_arm_back':5,
            'right_upper_leg_back':17,
            'left_lower_arm_front':8,
            'left_lower_leg_front':18,
            'left_lower_arm_back':7,
            'left_lower_leg_back':19,
            'right_lower_arm_front':8,
            'right_lower_leg_front':20,
            'right_lower_arm_back':9,
            'right_lower_leg_back':21,
            'left_hand':10,
            'left_foot': 22,
            'right_hand':11,
            'right_foot': 23
        }
    
        const {backgroundBlurAmount, edgeBlurAmount, flipHorizontal, faceBodyPartIdsToBlur} = config;

        await bodyPix.blurBodyPart(
            canvasElement, videoElement, personSegmentationParts, faceBodyPartIdsToBlur,
            backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
    
    
    
    
    }
     
    

    async grayScale(canvasElement, videoElement, personSegmentation, config){
        
        const {width, height} = config;
        const {data:map} = personSegmentation;
        
        // Extracting video data
        const { data:imgData } = await this.videoImageData(width, height, videoElement);

        //New canvas
        const canvas = canvasElement;
        /*Clean Canvas*/
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        const newImg = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
        const newImgData = newImg.data;
        //[r0, g0, b0, a0, r1, g1, b1, a1, ..., rn, gn, bn, an]
        for (let i = 0; i < map.length; i++) {
            //sacamos los r g b del video en si 
            const [r, g, b, a] = [imgData[i*4], imgData[i*4+1], imgData[i*4+2], imgData[i*4+3]];
            
            // GrayScale Effect
            const gray = ((0.3 * r) + (0.59 * g) + (0.11 * b));
            [
                newImgData[i*4],
                newImgData[i*4+1],
                newImgData[i*4+2],
                newImgData[i*4+3]
            ] = !map[i] ? [gray, gray, gray, 255] : [r, g, b, a];
        }
        canvas.getContext('2d').putImageData(newImg, 0, 0);/*Paint the canvas*/
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

        VideoTracking.addVideo(document.querySelector('body'), canvasElement);// No es necesario anadir el HTML.... xd

        const loopping = async () =>{/*Loop for animation*/
           
            if (type_prediciton == 1){/*Blur Background - - PersonSegmentation*/
                /*Opciones sacar datos de la imagen / mandar directamente el HTML tag*/
                //const config = { flipHorizontal: this.flipHorizontal, internalResolution: this.internalResolution, segmentationThreshold: this.segmentationThreshold}
                const prediction_frame = await model_prediction.segmentPerson(loaded_video, config);
                this.effect_blur_background(canvasElement, this.loaded_video, prediction_frame,  config);
                canvasElement.getContext('2d').clearRect(0, 0, canvasElement.width, canvasElement.height);
            }

            else if (type_prediciton === 2){/*Virtual Background - PersonSegmentation*/
                
                const prediction_frame = await model_prediction.segmentPerson(loaded_video, config);     
                this.virtual_background(canvasElement, this.loaded_video, prediction_frame,  config);
                canvasElement.getContext('2d').clearRect(0, 0, canvasElement.width, canvasElement.height);
            }

            else if(type_prediciton === 3){/*Gray SCale - PersonSegmentation*/
                
                const prediction_frame = await model_prediction.segmentPerson(loaded_video, config);     
                this.grayScale(canvasElement, this.loaded_video, prediction_frame, config);
                canvasElement.getContext('2d').clearRect(0, 0, canvasElement.width, canvasElement.height);
            }

            else if(type_prediciton === 4){/*Blur Body PARTS - PersonSegmentationPARTS*/
                const prediction_frameParts = await model_prediction.segmentPersonParts(loaded_video, config); 
                this.blurBodyPart_(canvasElement, this.loaded_video, prediction_frameParts, config);
            }
            /*Cleaning canvas*/
            

            if(this.stop){
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

/* Podemos definir 3 categorias Small, Medium, High Para la configuracion del Modelo*/
const model_config = { architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2}

/*configuraciones de la prediciones*/
const effect_config_precission = {  flipHorizontal: false, internalResolution: 'high', segmentationThreshold: 0.7,  width: 640, height:480}

/*Podemos Definir las dimensiones del video*/
const config_constrains = {audio: false, video: true}



/*Configuracion del los Efectos*/
const config_effect_bokek = {backgroundBlurAmount: 5, edgeBlurAmount: 5, ...effect_config_precission};

const config_virtual_background = {backgroundBlurAmount: 1, edgeBlurAmount: 1,  URL: './js.jpg', ...effect_config_precission};
const config_greyScale = {...effect_config_precission};
const config_blur_body_part = { backgroundBlurAmount: 10, edgeBlurAmount: 5, faceBodyPartIdsToBlur: [0, 1], ...effect_config_precission };


/*Objecto Tracker*/
const Tracking = new VideoTracking(640, 480, model_config, config_constrains, effect_config_precission);



//Tracking.predictionModel.w
/*Implementando 1...PersonSementation, Blur Background */
//Tracking.predictionModel.loop_(1, Tracking.canvasElement,  config_effect_bokek);
//const test = Tracking.predictionModel.request_canvas_MediaStream(25);

//Implementado 2... VirtualBackground- PersonSegmenttion, 
//Tracking.predictionModel.loop_(2, Tracking.canvasElement,  config_virtual_background);
//const test_2 = Tracking.predictionModel.request_canvas_MediaStream(25);

//Implementado3  ... GrayScale Effect - Person Segmentation
//Tracking.predictionModel.loop_(3, Tracking.canvasElement,  config_greyScale);



//Implementando4 ... Blur BodyParts - PersonSegmentationParts
Tracking.predictionModel.loop_(4, Tracking.canvasElement,  config_blur_body_part);



//Falta el Loop
//console.log(Tracking.predictionModel);

/*Stop Anmation Loop*/
//Tracking.predictionModel.stopAnimationLoop();


















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

























