//check https://lutzroeder.github.io/netron/ to see inputs and outputs of the model
const modelUrl ='./model.json';
const execute = async () => {
    const model = await tf.loadGraphModel(modelUrl);
    const imageElement = document.querySelector('#hector');

    const colorMapUrl = './colormap.json'

    // load the color-map file
    const response = await fetch(colorMapUrl)
    let colorMap = await response.json();
    colorMap =  colorMap['colorMap'];

    const imageTensor = tf.browser.fromPixels(imageElement);//.print(verbose=true);
    
    const preprocessedInput = imageTensor.expandDims();//.print(verbose=true);
    const imageProcess = tf.cast(preprocessedInput, 'float32');
    const prediction = await model.predict(imageProcess);
    const squezee = tf.squeeze (prediction);
    const argmax = tf.argMax (squezee, 2);
    argmax.print(verbose=true);
    const imageWidth = prediction.shape[2];
    const imageHeight = prediction.shape[1];
    const canvas = document.querySelector('#canvas');
    const last = tf.cast(tf.cast(argmax.mul(tf.scalar(1/15)), 'int32'), 'float32');
    last.print(verbose=true);



    const image_out = await tf.browser.toPixels(last, canvas);
    
    //Blur that Sheit
    let src = cv.imread('canvas');
    let dst = new cv.Mat();
    // To distinguish the input and output, we graying the image.
    // You can try different conversions.
    //cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    //cv.imshow('canvas_out', dst);
    let ksize = new cv.Size(7, 7);
    cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
    cv.imshow('canvas_out', dst);
    src.delete(); dst.delete();

    //lets do composition
    let foreground = cv.imread('hector');
    let fr_dst = new cv.Mat();
    cv.cvtColor(foreground, fr_dst, cv.COLOR_BGR2RGB);

    cv.imshow('canvas_fore', fr_dst);

    let background = cv.imread('back');
    let bk_dst = new cv.Mat();
    cv.cvtColor(background, bk_dst, cv.COLOR_BGR2RGB);

    cv.imshow('canvas_fore', fr_dst);

    cv.imshow('canvas_back', bk_dst);

    let src1 = cv.imread("canvas_fore");
    let src2 = cv.imread("canvas_back");
    let dst_ = new cv.Mat();
    let mask_ = new cv.Mat();
    let dtype = -1;
    cv.add(src1, src2, dst_, mask_, dtype);
    cv.imshow('canvas_resu', dst_);



    // Add the masked foreground and background











}
execute();