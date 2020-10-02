import getImageData from '../VideoSetup/GetImageData.js';
import videoImageData from '../VideoSetup/GetVideoData.js';


async function virtualBackground(URL, width, height, tracker){
    
    //new canvas
    const canvas = tracker.canvas_1.firstChild;//cremaos un blank array para llenarlo
    const newImg = canvas.getContext('2d').createImageData(canvas.width, canvas.height);//create blank new ImageData
    const newImgData = newImg.data;

    //prediction
    const {data:map} = tracker.prediction;
    const pixelLength = map.length;
    
    //Video Data
    const { data: videoData } = videoImageData(1,tracker.video.width, tracker.video.height);
    
    //imageData
    const {data: imgData} = await getImageData(1, URL, width, height);
    
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
                                        250
                                    ]
    }

    //despues pintamos en el canvas original
    canvas.getContext('2d').globalCompositeOperation = 'destination-in';
    canvas.getContext('2d').putImageData(newImg, 0, 0);

    

}

export default virtualBackground;