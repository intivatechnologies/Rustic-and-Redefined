import PORTS from '@/assets/js/PORTS.js';

class Item {
    constructor(){
        this.itemInfo = {};
        this.beforeImages = [];
        this.afterImages = [];
        this.elementsQueued = false;
    }

    queueElementsByItem(categoryKey, itemIndex){
        if(!this.elementsQueued){
            this.elementsQueued = true;
            fetch(`${PORTS.SERVER}/item/image_lengths/${categoryKey}/${itemIndex}`)
            .then(res => res.json())
            .then(data => {
                let lengths = data;
                let i = -1, j = 0;

                let imagesFinishedCallback = () => {
                    fetch(`${PORTS.SERVER}/item/info/${categoryKey}/${itemIndex}`)
                    .then(res => res.json())
                    .then(data => { this.itemInfo = data.itemInfo; });
                };
                
                let thumbnailPendingFlag = -1;
                let imageCaptureInterval = window.setInterval(() => {
                    if(i + 1 >= lengths.beforeLength + lengths.afterLength){
                        window.clearInterval(imageCaptureInterval);
                        imagesFinishedCallback();
                    } else if(i != j){
                        ++i;
                        let request = `${PORTS.SERVER}/item/`;
                        let isBefore;
                        if(lengths.beforeLength > 0 && i < lengths.beforeLength){
                            request += `beforeImage/${categoryKey}/${itemIndex}/${i}`;
                            isBefore = true;
                        } else {
                            request += `afterImage/${categoryKey}/${itemIndex}/${i - lengths.beforeLength}`;
                            isBefore = false;
                            if(thumbnailPendingFlag == -1)
                                thumbnailPendingFlag = 0;
                        }

                        if(thumbnailPendingFlag == 0){
                            thumbnailPendingFlag = 1;
                            j++;
                        } else
                            fetch(request)
                            .then(res => res.blob())
                            .then(blob => {
                                let fr = new FileReader();
                                let frCallback = () => {
                                    if((j + 1) >= lengths.beforeLength + lengths.afterLength){
                                        window.clearInterval(imageCaptureInterval);
                                        imagesFinishedCallback();
                                    }
                                    j++;
                                };
                                fr.onload = ev => {
                                    if(isBefore)
                                        this.beforeImages.push(ev.target.result);
                                    else
                                        this.afterImages.push(ev.target.result);
                                    frCallback();
                                };
                                fr.onerror = err => {
                                    console.error(err);
                                    frCallback();
                                };

                                fr.readAsDataURL(blob);
                            });
                    }
                }, 50);
            });
        }
    }
}

class ItemCategory {
    constructor(value, key){
        this.value = value;
        this.key = key;
        this.toggled = false;
        this.itemsQueued = false;
        this.itemLengthQueued = -1;
        this.items = [];
    }

    toggle(){
        this.toggled = !this.toggled;
        if(!this.itemsQueued)
            this.queueItemsByCategory();
    }

    queueItemsByCategory(){
        if(!this.itemsQueued){
            this.itemsQueued = true;
            fetch(`${PORTS.SERVER}/item/category_length/${this.key}`)
            .then(res => res.json())
            .then(data => {
                this.itemLengthQueued = data.itemLength;
                if(!this.itemLengthQueued || this.itemLengthQueued == 0)
                    return;
                
                let i = 0, j = 1;
                let itemInterval = window.setInterval(() => {
                    if(i != j){
                        fetch(`${PORTS.SERVER}/item/afterImage/${this.key}/${i++}/0`)
                        .then(res => res.blob())
                        .then(blob => {
                            let item = new Item();
                            let fr = new FileReader();
                            let frCallback = () => {
                                this.items.push(item);
                                if((++j - 1) >= this.itemLengthQueued)
                                    window.clearInterval(itemInterval);
                            };

                            fr.onload = ev => {
                                item.afterImages.push(ev.target.result);
                                frCallback();
                            };
                            fr.onerror = err => {
                                console.error(err);
                                frCallback();
                            };
                            fr.readAsDataURL(blob);
                        });
                    }
                }, 50);
            });
        }
    }
}

export default ItemCategory;