const videoImageData = (videoid = 1, width, height) => {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = document.querySelector(`video[data-videoid="${videoid}"]`);
 
    context.drawImage(img, 0, 0 );
    var theData = context.getImageData(0, 0, width, height);
    return theData;
}
 
export default videoImageData;