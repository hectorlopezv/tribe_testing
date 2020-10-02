async function makePredictionPerson(tracker){
    const config = {
      flipHorizontal: false,
      internalResolution: 'full',
      segmentationThreshold: 0.7
    }
    tracker.prediction = await tracker.net.segmentPerson(tracker.video, config);
    //console.log(prediction);
    return tracker.prediction; 
  }

  export default makePredictionPerson;