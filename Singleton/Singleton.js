class Tracker {
    constructor(){
        if(!Tracker.istance){
            this.net = 'x1';
            this.videos = [];
            this.video = 'video';
            this.prediction = 'x2';
            Tracker.instance = this;
        }

        return Tracker.instance
    }

    execute(){

    }


}
export default Tracker;