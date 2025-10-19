import PORTS from './PORTS.js';

class FetchController {
    constructor(){
        this.getCombination = extension => `${PORTS.SERVER}${extension}`;
    }

    getJson(extension, dataCallback, errorCallback=null){
        fetch(this.getCombination(extension))
            .then(res => res.json())
            .then(data => dataCallback(data))
            .catch(err => {
                if(err){
                    console.error(err);
                    if(errorCallback != null)
                        errorCallback(err);
                }
            });
    }

    async getAsyncJson(extension){
        let res = await fetch(this.getCombination(extension));
        let resJson = await res.json();
        return resJson;
    }

    postJson(extension, options, dataCallback, errorCallback=null){
        fetch(this.getCombination(extension), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(options)
        }).then(res => res.json())
        .then(data => dataCallback(data))
        .catch(err => {
            if(err){
                console.error(err);
                if(errorCallback != null)
                    errorCallback(err);
            }
        });
    }

    getBlob(extension, dataCallback, errorCallback=null){
        fetch(this.getCombination(extension))
        .then(res => {
            if(!res.ok)
                throw new Error("Failed to fetch PDF");
            else
                return res.blob();
        }).then(blob => dataCallback(blob))
        .catch(err => {
            if(err){
                console.error(err);
                if(errorCallback != null)
                    errorCallback(err);
            }
        });
    }

    getPdf(extension, dataCallback, errorCallback=null){
        fetch(this.getCombination(extension))
        .then(res => {
            if(!res.ok)
                throw new Error("Failed to fetch PDF");
            else
                return res.blob();
        }).then(blob => {
            let fr = new FileReader();
            fr.addEventListener("load", ev => dataCallback(ev.target.result));
            fr.readAsDataURL(blob);
        }).catch(err => {
            if(err){
                console.error(err);
                if(errorCallback != null)
                    errorCallback(err);
            }
        });
    }
};

let fetch_controller = new FetchController();
export default fetch_controller;