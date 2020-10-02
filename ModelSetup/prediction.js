async function makePredictionPerson(tracker){
    const config = {
      flipHorizontal: true,
      internalResolution: 'high',
      segmentationThreshold: 0.8
    }
    tracker.prediction = await tracker.net.segmentPerson(tracker.video, config);
    //console.log(prediction);
    return tracker.prediction; 
  }

  export default makePredictionPerson;