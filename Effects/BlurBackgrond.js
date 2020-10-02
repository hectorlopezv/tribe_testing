

function blurBackground (canvas, img_video, segmentation, 
    backgroundBlurAmount,edgeBlurAmount, flipHorizontal){
    
    bodyPix.drawBokehEffect(
        canvas, img_video, segmentation, backgroundBlurAmount,
            edgeBlurAmount, flipHorizontal);
}

export default blurBackground;
