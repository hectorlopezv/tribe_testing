
const blur2 = (tracker) => {
    const maskBackground = true;
// Convert the segmentation into a mask to darken the background.
const foregroundColor = {r: 0, g: 0, b: 0, a: 0};//la persona
const backgroundColor = {r: 0, g: 0, b: 0, a: 255};//el background
const backgroundDarkeningMask = bodyPix.toMask(
    tracker.prediction, foregroundColor, backgroundColor);

const opacity = 1;
const maskBlurAmount = 6.5;
const flipHorizontal = false;
const canvas = document.querySelector('canvas');
const img = document.querySelector(`video[data-videoid="1"]`);
// Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
// maskBlurAmount set to 3, this will darken the background and blur the
// darkened background's edge.
const x = bodyPix.drawMask(canvas, img, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);


}

 
export default blur2;
