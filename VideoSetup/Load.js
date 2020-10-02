async function loadVideo() {
    let state_video;
    try {
      state_video = setVideo();
    } catch (e) {
       throw e;
    }
    //"comenzamos" el stream para que se carge y podamos a empezar a aplica prediciones
    state_video.play();
  }
  export default loadVideo;