<script>
    import '@/assets/css/dashboard.css';
    import Algorithm from '@/assets/js/Algorithm.js';
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import HoverClassAnim from '../../anim/class/HoverClassAnim.vue';
    import ImageLoader from '../../image/ImageLoader.vue';
    import Navbar from '@/components/layouts/nav/Navbar.vue';
    import EncryptedPage from '@/components/layouts/pages/EncryptedPage.vue';
    import Parallax from '../../image/Parallax.vue';
    import PORTS from '@/assets/js/PORTS.js';
    import fetch_controller from '@/assets/js/fetch_controller.js';
    import wait from '@/assets/js/wait.js';

    import mainRouter from '@/router/index.js';

    export default {
        extends: EncryptedPage,

        components: {
            ClassAnim,
            HoverClassAnim,
            ImageLoader,
            Navbar,
            Parallax
        },

        data(){
            return {
                dashboardInterval: undefined,
                displaysHighlighted: false,
                displayImages: {
                    data: new FormData(),
                    beforeInputs: [],
                    beforeURL: [],
                    afterInputs: [],
                    afterURL: []
                },
                dsOpacity1: 1,
                dsOpacity2: 1,
                dsOpacity3: 1,
                dsOpacity4: 1,
                loginState: 0,
                productEditMode: false,
                editModeBefore: false,
                itemCategoryIndexSelected: 0,
                itemCategories: [],
                itemCategoryKeys: [],
                newsletter: {
                    imageFiles: [],
                    imagesPerLane: []
                },
                marketplace: {
                    names: [],
                    links: []
                },
                adminLogged: false,
                USER_OBSERVABLES: {
                    projects: true
                }
            }
        },

        methods: {
            toggleThumbnailContext(index){
                this.$refs[`thumbnail-context-${index}`].toggle();

                //attributes do not update on lists, so I separated the variables
                let notBlack = this.$refs[`thumbnail-context-${index}`].isToggled();
                switch(index){
                    case 0:
                        this.dsOpacity1 = notBlack ? 0 : 1;
                        break;
                    case 1:
                        this.dsOpacity2 = notBlack ? 0 : 1;
                        break;
                    case 2:
                        this.dsOpacity3 = notBlack ? 0 : 1;
                        break;
                    case 3:
                        this.dsOpacity4 = notBlack ? 0 : 1;
                        break;
                }
            },

            getFileInput(){
                let inp = document.createElement("input");
                inp.type = "file";
                inp.accept = "image/*";
                inp.multiple = true;
                return inp;
            },

            insertImages(files){
                let inp = this.getFileInput();
                inp.files = files;

                let capacityFullMsg = str =>
                    window.alert("Capacity for the " + str + " images are at full (Too many images).");

                if(this.editModeBefore){
                    if(this.displayImages.beforeURL.length + files.length > 4){
                        capacityFullMsg("before");
                        return;
                    }
                    this.displayImages.beforeInputs.push(inp);
                } else {
                    if(this.displayImages.afterURL.length + files.length > 4){
                        capacityFullMsg("after");
                        return;
                    }
                    this.displayImages.afterInputs.push(inp);
                }

                for(let file of files){
                    if(file.type.match('image.*')){
                        var fr = new FileReader();
                        fr.onload = ev => {
                            let len;
                            if(this.editModeBefore){
                                this.displayImages.beforeURL.push(ev.target.result);
                                len = this.displayImages.beforeURL.length;
                            } else {
                                this.displayImages.afterURL.push(ev.target.result);
                                len = this.displayImages.afterURL.length;
                            }

                            this.$refs[`display-inner-${len - 1}`].shovePath(ev.target.result);
                            this.toggleThumbnailContext(len - 1);
                        };
                        fr.readAsDataURL(file);
                    }
                }
            },

            setEditModeBefore(bool){
                let getDi = index => this.$refs[`display-inner-${index}`],
                    getTc = index => this.$refs[`thumbnail-context-${index}`];
                let runIterations = urls => {
                    for(let i = 0; i < 4; i++){
                        if(i < urls.length){
                            getDi(i).shovePath(urls[i]);
                            if(!getTc(i).isToggled())
                                this.toggleThumbnailContext(i);
                        } else {
                            getDi(i).shovePath(undefined);
                            if(getTc(i).isToggled())
                                this.toggleThumbnailContext(i);
                        }
                    }
                };

                if(bool != this.editModeBefore){
                    runIterations(bool ? this.displayImages.beforeURL : this.displayImages.afterURL);
                    this.editModeBefore = bool;
                }
            },

            getShieldOpacityAttr(i){
                console.log("Testing shield opacity at index " + i);
                if(editModeBefore)
                    return this.displayImages.before.length > i ? '0' : '1';
                else
                    return this.displayImages.after.length > i ? '0' : '1';
            },

            dropImage(event){
                event.preventDefault();
                this.insertImages(event.dataTransfer.files);
            },

            dropImageWindow(event){
                event.preventDefault();
            },

            clearProduct(ev){
                this.$refs['product-name'].value = '';
                this.$refs['product-about'].value = '';
                if(!this.USER_OBSERVABLES.projects)
                    this.$refs['product-price'].value = '';

                this.displayImages.before = [];
                this.displayImages.beforeURL = [];
                this.displayImages.after = [];
                this.displayImages.afterURL = [];
                for(let i = 0; i < 4; i++){
                    this.$refs[`display-inner-${i}`].overrideProcessedPath(undefined);
                    if(this.$refs[`thumbnail-context-${i}`].isToggled())
                        this.$refs[`thumbnail-context-${i}`].toggle();
                }

                this.dsOpacity1 = 1;
                this.dsOpacity2 = 1;
                this.dsOpacity3 = 1;
                this.dsOpacity4 = 1;
            },

            submitProduct(ev){
                ev.preventDefault();
                if(this.itemCategoryIndexSelected > 0 && (this.$refs['product-name'].value == ''
                || this.$refs['product-price'].value == '' || this.$refs['product-about'].value == ''
                || this.$refs['product-width'].value == '' || this.$refs['product-height'].value == ''
                || this.$refs['product-length'].value == '' || this.$refs['product-weight'].value == ''))
                    window.alert("All informative values must be filled for the item.");
                else if(this.itemCategoryIndexSelected == 0 && this.$refs['product-about'].value != ''
                    && this.$refs['product-name'].value == '')
                    window.alert("Your project must be labelled with a name IF it has a description.");
                else if(!this.displayImages.afterURL[0])
                    window.alert("There must be at least one image in the after department to showcase your item.");
                else {
                    this.$refs['wait-msg'].toggle();

                    let itemCategoryKey = this.itemCategoryKeys[this.itemCategoryIndexSelected];
                    let itemInfo = {
                        name: this.$refs['product-name'].value,
                        about: this.$refs['product-about'].value,
                    };
                    let indexAt = -1;
                    if(this.$refs['product-price']){
                        itemInfo['price'] = this.$refs['product-price'].value;
                        itemInfo['weight'] = Number(this.$refs['product-weight'].value);
                        itemInfo['width'] = Number(this.$refs['product-width'].value);
                        itemInfo['height'] = Number(this.$refs['product-height'].value);
                        itemInfo['length'] = Number(this.$refs['product-length'].value);
                        
                        if(isNaN(itemInfo['weight']) || isNaN(itemInfo['width'])
                            || isNaN(itemInfo['height']) || isNaN(itemInfo['length'])){
                            window.alert("Please make sure the product measurements are correct.");
                            return;
                        }
                    } 
                    if(localStorage.getItem('edit-item-place-at'))
                        indexAt = localStorage.getItem('edit-item-place-at');
                    console.log("indexAt: " + indexAt);

                    let selectIndex = undefined;
                    let ei = localStorage.getItem('edit-item-category-index');
                    if(ei)
                        selectIndex = Number(ei);

                    console.log("Posting item with selectIndex: " + selectIndex);
                    fetch_controller.postJson('/item/post', {
                        itemCategoryKey: itemCategoryKey,
                        itemInfo: itemInfo,
                        indexAt: indexAt,
                        beforeLength: this.displayImages.beforeURL.length,
                        selectIndex: selectIndex
                    }, data => {
                        let processBlob = (url) => {
                            var byteString = atob(url.split(',')[1]);
                            var mimeString = url.split(',')[0].split(':')[1].split(';')[0];
                            var ab = new ArrayBuffer(byteString.length);
                            var ia = new Uint8Array(ab);
                            for (var i = 0; i < byteString.length; i++)
                                ia[i] = byteString.charCodeAt(i);

                            return new Blob([ab], {type: mimeString});
                        };

                        for(let url of this.displayImages.beforeURL)
                            this.displayImages.data.append("images", processBlob(url));
                        for(let url of this.displayImages.afterURL)
                            this.displayImages.data.append("images", processBlob(url));

                        fetch(`${PORTS.SERVER}/item/post_images`, {
                            method: "POST",
                            body: this.displayImages.data
                        }).then(res => {
                            localStorage.setItem('admin-edit-mode', 'true');
                            if(this.itemCategoryIndexSelected > 0)
                                localStorage.setItem('edit-item-category-key', itemCategoryKey + '');
                            window.location.href = `${PORTS.CLIENT}/${this.itemCategoryIndexSelected > 0 ? "shop" : "projects"}`;
                        }).catch(err => {
                            if(err){
                                console.error(err);
                                window.alert("An error has occurred.");
                            }
                        });
                    });
                }
            },

            getSubscribersList(){
                fetch(`${PORTS.SERVER}/newsletter/subscriber_list`)
                .then(res => {
                    if(!res.ok){
                        console.error("An error has occured.");
                        return;
                    }

                    return res.json();
                }).then(data => {
                    this.$refs['newsletter-subscribers'].value = "";
                    for(let subscriber of data.subscribers)
                        this.$refs['newsletter-subscribers'].value += subscriber + "\n";
                }).catch(err => { if(err) console.error(err); })
            },

            selectItemCategory(){
                this.itemCategoryIndexSelected = this.$refs['item-category-select'].selectedIndex;
            },

            getItemCategoriesList(){
                fetch(`${PORTS.SERVER}/item/categories_and_keys`)
                .then(res => {
                    if(!res.ok){
                        console.error("An error has occurred.");
                        return;
                    }

                    return res.json();
                }).then(data => {
                    this.itemCategories = data.itemCategories;
                    this.itemCategoryKeys = data.itemCategoryKeys;

                    //check if in product edit mode, update dashboard
                    /*
                    this.productEditMode = localStorage.getItem('product-edit-mode');
                    if(this.productEditMode){
                        let editItemCategoryKey = Number(localStorage.getItem('edit-item-category-key'));
                        for(let i = 0; i < this.itemCategoryKeys.length; i++){
                            if(this.itemCategoryKeys[i] == editItemCategoryKey){
                                this.itemCategoryIndexSelected = i;
                                break;
                            }
                        }

                        this.$refs['shop-inner'].toggle();
                    }
                    */
                });
            },

            sendNewsletter(){
                let field1 = this.$refs['newsletter-subject'], field2 = this.$refs['newsletter-body'];
                if(field1.value.length > 0 && field2.textContent.length > 0){
                    let textDivs = [];
                    for(let textDiv of document.getElementsByClassName("text-division"))
                        textDivs.push(textDiv.textContent);
                    
                    fetch(`${PORTS.SERVER}/newsletter/send_text`, PORTS.postOptions({
                        textDivs: textDivs,
                        imagesPerLane: this.newsletter.imagesPerLane,
                        subject: document.getElementById('newsletter-subject').value
                    })).then(res => {
                        let fd = new FormData();
                        for(let file of this.newsletter.imageFiles)
                            fd.append("images", file);
                        fetch(`${PORTS.SERVER}/newsletter/send_images`, {
                            method: "POST",
                            body: fd
                        }).then(res => {
                            if(!res.ok){
                                window.alert("An error has occured.");
                                return;
                            }

                            window.alert("Message sent to subscriber list.");
                            this.$refs['newsletter-subject'].value = "";
                            this.$refs['newsletter-body'].textContent = "";
                        });
                    }).catch(err => {
                        if(err){
                            console.error(err);
                            window.alert("An error occurred. Please ensure you are connected to WiFi.");
                        }
                    });
                } else
                    window.alert("Make sure all required fields are filled before sending.");
            },

            addItemCategory(){
                let ncategory = this.$refs['item-category-new'].value;

                if(ncategory.length > 0){
                    this.$refs['item-category-new'].value = '';
                    this.itemCategories.push(ncategory);

                    fetch(`${PORTS.SERVER}/item/add_category`, PORTS.postOptions({ newCategory: ncategory }))
                    .then(res => res.json())
                    .then(data => {
                        this.itemCategoryKeys.push(data.itemCategoryKey);
                        this.itemCategoryIndexSelected = this.itemCategoryKeys.length - 1;
                        this.USER_OBSERVABLES.projects = false;
                    }).catch(err => {
                        if(err){
                            this.itemCategories.pop();
                            window.alert("An error has occured.");
                        }
                    });
                }
            },

            deleteItemCategory(index){
                this.itemCategories = new Algorithm.DeleteAlgorithm(this.itemCategories).getProduct(index);
                this.itemCategoryKeys = new Algorithm.DeleteAlgorithm(this.itemCategoryKeys).getProduct(index);
                
                fetch(`${PORTS.SERVER}/item/delete_category`, PORTS.postOptions({ index: index }));
            },

            visitItemCategory(index){
                localStorage.setItem('admin-edit-mode', 'true');
                fetch(`${PORTS.SERVER}/item/visit_category`, PORTS.postOptions({ index: index }))
                .then(res => {
                    if(!res.ok){
                        window.alert("An error occurred");
                        return;
                    }

                    return res.json();
                }).then(data => {
                    if(index > 0)
                        localStorage.setItem('edit-item-category-key', data.itemCategoryKey + '');
                    window.location.href = `${PORTS.CLIENT}/${index != 0 ? "shop" : "projects"}`;
                });
            },

            attachToNewsletter(){
                //this.newsletterPlainText = document.getElementById("newsletter-body").textContent;
                let newsBody = document.getElementById("newsletter-body");
                let fileInp = this.getFileInput();
                fileInp.addEventListener("change", ev => {
                    this.newsletter.imagesPerLane.push(0);
                    for(let file of ev.target.files){
                        this.newsletter.imageFiles.push(file);
                        this.newsletter.imagesPerLane[this.newsletter.imagesPerLane.length - 1]++;
                        
                        let fr = new FileReader();
                        fr.onload = ev => {
                            let subsectionImg = document.createElement("img");
                            subsectionImg.src = ev.target.result;
                            subsectionImg.alt = "Newsletter item";
                            subsectionImg.style.width = "225pt";
                            newsBody.appendChild(subsectionImg);

                            let textDivision = document.createElement("div");
                            textDivision.className = "text-division";
                            textDivision.id = "text-division-1";
                            textDivision.setAttribute("contenteditable", "contenteditable");
                            textDivision.textContent = "";
                            newsBody.appendChild(textDivision);
                        };

                        fr.readAsDataURL(file);
                    }
                });
                fileInp.click();
            },

            addToMarketplace(){
                let name = this.$refs['marketplace-name'].value, link = this.$refs['marketplace-link'].value;
                if(!link.includes('https://') && !link.includes('http://'))
                    link = 'https://' + (!link.includes('www.') ? 'www.' : '') + link;

                fetch(`${PORTS.SERVER}/marketplace/add_partner`, PORTS.postOptions({
                    name: name,
                    link: link
                })).then(res => {
                    this.marketplace.names.push(name);
                    this.marketplace.links.push(link);
                    this.$refs['marketplace-name'].value = '';
                    this.$refs['marketplace-link'].value = '';
                }).catch(err => {
                    if(err){
                        console.error(err);
                        window.alert("An error has occurred.");
                    }
                });
            },

            requestAddToMarketplace(ev){
                if(ev.keyCode == 13)
                    this.addToMarketplace();
            },

            deleteFromMarketplace(index){
                fetch_controller.postJson('/marketplace/delete_partner', { index: index }, data => {
                    this.marketplace.names = new Algorithm.DeleteAlgorithm(this.marketplace.names).getProduct(index);
                    this.marketplace.links = new Algorithm.DeleteAlgorithm(this.marketplace.links).getProduct(index);
                });
            },

            getMarketplacePartners(){
                fetch(`${PORTS.SERVER}/marketplace/get_partners`)
                .then(res => res.json())
                .then(data => {
                    /*
                    console.log("marketplace partners:");
                    console.log(data);
                    for(let i = 0; i < this.marketplace.names.length; i++){
                        console.log("Marketplace partner:");
                        console.log("Name: " + this.marketplace.names[i]);
                        console.log("Link: " + data.marketplace.links[i]);
                    }
                        */
                    this.marketplace.names = data.marketplace.names;
                    this.marketplace.links = data.marketplace.links;
                }).catch(err => {
                    if(err){
                        console.error(err);
                        window.alert("An error has occurred.");
                    }
                });
            },

            async requestItemModification(){
                let catKey = localStorage.getItem('edit-item-category-key');
                let catIndex = localStorage.getItem('edit-item-category-index');
                let indexAt = localStorage.getItem('edit-item-place-at');

                if(catKey && (catIndex || indexAt)){
                    this.$refs['shop-inner'].toggle();

                    fetch_controller.getJson('/item/itemCategoryKeys', async comparison => {
                        for(let i = 0; i < comparison.itemCategoryKeys.length; i++)
                            if(catKey == comparison.itemCategoryKeys[i]){
                                this.itemCategoryIndexSelected = i;
                                break;
                            }
                    });
                }

                if(catKey && catIndex){
                    this.$refs['shop-inner'].toggle();
                    this.productEditMode = true;

                    fetch_controller.getJson(`/item/info/${catKey}/${catIndex}`, data => {
                        fetch_controller.getJson('/item/itemCategoryKeys', async comparison => {
                            for(let i = 0; i < comparison.itemCategoryKeys.length; i++)
                                if(catKey == comparison.itemCategoryKeys[i]){
                                    this.itemCategoryIndexSelected = i;
                                    break;
                                }

                            await this.$nextTick();

                            this.$refs['product-name'].value = data.itemInfo.name;
                            this.$refs['product-about'].value = data.itemInfo.about;
                            if(data.itemInfo.price){
                                document.getElementById('product-price').value = data.itemInfo.price;
                                document.getElementById('product-width').value = data.itemInfo.width;
                                document.getElementById('product-height').value = data.itemInfo.height;
                                document.getElementById('product-length').value = data.itemInfo.length;
                                document.getElementById('product-weight').value = data.itemInfo.weight;
                            }
                        });
                    });

                    fetch_controller.getJson(`/item/image_lengths/${catKey}/${catIndex}`, async data => {
                        let loadImage = (itemIndex, sectionRoute) => {
                            return new Promise((resolve, reject) => {
                                fetch_controller.getBlob(`/item/${sectionRoute}/${catKey}/${catIndex}/${itemIndex}`, blob => {
                                    let fr = new FileReader();
                                    fr.addEventListener("load", ev => resolve(ev.target.result));
                                    fr.addEventListener("error", () => reject());
                                    fr.readAsDataURL(blob);
                                });
                            });
                        };

                        for(let i = 0; i < data.beforeLength; i++){
                            let url = await loadImage(i, "beforeImage");
                            this.displayImages.beforeURL.push(url);
                        }
                        for(let i = 0; i < data.afterLength; i++){
                            let url = await loadImage(i, "afterImage");
                            this.displayImages.afterURL.push(url);
                        }
                        for(let i = 0; i < data.afterLength; i++){
                            this.$refs[`display-inner-${i}`].shovePath(this.displayImages.afterURL[i]);
                            this.toggleThumbnailContext(i);
                        }
                    });
                }
            },

            redirectHome(){
                mainRouter.replace({ path: '/' });
                localStorage.clear();
            }
        },

        mounted(){
            if(screen.availWidth < 1025)
                window.alert("This page should only be accessed through a desktop computer.");

            let loginId = localStorage.getItem("loginId");
            if(loginId)
                wait.millis(250, () => fetch(`${PORTS.SERVER}/dashboard/authentication/${loginId}`)
                    .then(res => res.json())
                    .then(data => {
                        this.adminLogged = data.authentic;
                        this.loginState = 1;
                        this.getMarketplacePartners();
                        this.getSubscribersList();
                        this.getItemCategoriesList();
                        this.requestItemModification();
                    }).catch(err => {
                        if(err){
                            this.loginState = 2;
                            window.location.href = `${PORTS.CLIENT}/login`;
                        }
                    }));

            //image drop box hover event
            for(let i = 0; i < 4; i++){
                this.$refs[`display-${i}`].addHoverExtension(i => {
                    for(let j = 0; j < 4; j++){
                        if(j != i)
                            this.$refs[`display-${j}`].toggle();
                    }
                });
            }
            window.addEventListener("dragover", this.dropImageWindow, false);
            window.addEventListener("drop", this.dropImage);
        },

        beforeUnmount(){
            window.removeEventListener("dragover", this.dropImageWindow, false);
            window.removeEventListener("drop", this.dropImage);

            localStorage.removeItem('edit-item-category-key');
            localStorage.removeItem('edit-item-category-index');
            localStorage.removeItem('edit-item-place-at');
        }
    }
</script>