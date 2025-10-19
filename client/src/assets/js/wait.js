var wait = {
    millis(time, func){
        let interval = window.setInterval(() => {
            func();
            window.clearInterval(interval);
        }, time);
    },
    
    seconds(time, func){
        this.millis(time * 1000, func);
    }
};

export default wait;