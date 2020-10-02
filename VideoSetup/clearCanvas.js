async function clearCanvas(){
    const context = canvas_main.getContext('2d');
    await context.clearRect(0, 0, canvas_main.width, canvas_main.height);
  }

export default clearCanvas;
  