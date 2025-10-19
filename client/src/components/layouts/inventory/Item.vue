<template>
    <div class="item">
        <div id="all-showcase-images" class="transition" ref="all-showcase-images">
            <h4 v-if="data.beforeImages.length > 0">Before</h4>
            <div class="showcase-images">
                <div :id="displayIndex == index ? 'showcase-image-selected' : ''"
                class="showcase-image-container" v-for="(image, index) of data.beforeImages"
                @click="() => selectShowcaseImage(index)">
                    <parallax shield-opacity="0" :override-path="image" :key="index" />
                </div>
            </div>
            <h4 v-if="data.afterImages.length > 0">After</h4>
            <div class="showcase-images">
                <div :id="(displayIndex - data.beforeImages.length) == index ? 'showcase-image-selected' : ''"
                class="showcase-image-container" v-for="(image, index) of data.afterImages"
                @click="() => selectShowcaseImage(index + data.beforeImages.length)">
                    <parallax shield-opacity="0" :override-path="image" :key="index" />
                </div>
            </div>
            <div class="showcase-display" ref="showcase-display">
                <img :src="displayIndex < data.beforeImages.length ? data.beforeImages[displayIndex]
                    : data.afterImages[displayIndex - data.beforeImages.length]" alt="Product Display" />
            </div>
        </div>
        <div v-if="data.itemInfo" class="showcase-info transition" ref="showcase-info">
            <div class="item-info">
                <h2>{{ data.itemInfo.name }}</h2>
                <h3>${{ (data.itemInfo.price * priceMod).toFixed(2) }} <small>{{
                    priceMod == 1 ? "CAD" : "USD" }}</small></h3>
                <h5>Size (Inches): {{ data.itemInfo.width }} x {{ data.itemInfo.height }} x {{ data.itemInfo.length }},
                    Weight: {{ data.itemInfo.weight }} lbs</h5>
                <p>{{ data.itemInfo.about }}</p>
            </div>
            <div class="radio-label-group" @click="() => this.setTransportationMethodPickup(true)">
                <input type="radio" name="transportation-method" ref="radio-pickup" />
                <label for="pickup">Pick Up</label><br />
            </div>
            <div class="radio-label-group" @click="() => this.setTransportationMethodPickup(false)">
                <input type="radio" name="transportation-method" ref="radio-shipout" />
                <label for="shipout">Ship Out To Address</label><br />
            </div><br />
            <button class="checkout-button" @click="checkoutItem">
                <image-loader path="icon/shopping_cart.png" alt-value="Buy" />
            </button>
        </div>
        <class-anim-display-controller target-class="transaction-container" ref="transaction-container">
            <click-class-anim target-class="transaction-opening" ref="transaction-opening-0" v-if="!transportationMethodPickup"
            @clicked="() => transactionOpeningClicked(0)">
                <hr />
                <label class="transaction-controller-label" for="transaction-controller-label">
                    <div class="tc-opening">&#62;</div> Shipping Info
                </label>
            </click-class-anim>
            <class-anim-display-controller target-class="transaction" ref="transaction-0" alternate-classes="transition"
            v-if="!transportationMethodPickup">
                <label for="name">Legal Name</label><br />
                <input class="required-inp" type="text" placeholder="First Name" v-model="stored.firstName"
                    @keyup="interruptVerificationProcess" ref="first-name" /><br />
                <input class="required-inp" type="text" placeholder="Last Name" v-model="stored.lastName"
                    @keyup="interruptVerificationProcess" ref="last-name" /><br /><br />
    
                <label for="address">Home Address</label><br />
                <select @change="updateCountry" ref="country-select" id="country-select">
                    <!--
                    <option>Canada</option>
                    <option>United States of America</option>
                    -->
                </select><br />
                <input id="address" class="required-inp" type="text" placeholder="Home Address"
                    @keyup="interruptVerificationProcess" ref="address" v-model="stored.address" /><br />
                <input id="city" type="text" placeholder="City" @keyup="interruptVerificationProcess" ref="city"
                    v-model="stored.city" /><br />
                <input type="text" placeholder="Unit Number (optional)"
                    @keyup="interruptVerificationProcess" ref="unit-number" /><br />
                <input id="area-code" class="required-inp" type="text" placeholder="Postal/ZIP Code"
                    @keyup="interruptVerificationProcess" ref="area-code" v-model="stored.areaCode" /><br />
                <select id="regions" ref="country-regions">
                    <option v-for="region of (isInternational ? usRegions : canadaRegions)">
                        {{ region }}
                    </option>
                </select>
            </class-anim-display-controller>

            <click-class-anim target-class="transaction-opening" ref="transaction-opening-1"
            @clicked="() => transactionOpeningClicked(1)">
                <hr />
                <label class="transaction-controller-label" for="transaction-controller-label">
                    <div class="tc-opening">&#62;</div> Contact Info
                </label>
            </click-class-anim>
            <class-anim-display-controller target-class="transaction" ref="transaction-1" alternate-classes="transition">
                <div v-if="transportationMethodPickup">
                    <p>
                        The Pick Up option is only for those within reasonable distance to The Fraser Valley, British
                        Columbia, Canada. Please note that we will not make exceptions for the pickup location.
                    </p><br />
                </div>

                <input class="required-inp" type="text" placeholder="First Name" v-model="stored.firstName"
                    @keyup="interruptVerificationProcess" /><br />
                <input class="required-inp" type="text" placeholder="Last Name" v-model="stored.lastName"
                    @keyup="interruptVerificationProcess" /><br />
                <input class="required-inp" type="text" placeholder="Phone Number" value="604-751-5569"
                    @keyup="interruptVerificationProcess" ref="phone-number" /><br />
                <input class="required-inp" type="text" placeholder="Email" v-model="stored.email"
                    @keyup="interruptVerificationProcess" ref="email" /><br /><br />

                <button class="transaction-button" @click="verifyInfo">
                    <div class="transaction-button-label">Continue to Checkout</div>
                </button>
                <class-anim-display-controller target-class="verify-info-request" ref="verify-info-request"
                alternate-classes="transition">
                    <p>
                        To securely checkout, you must verify your <a :href="`https://www.${stored.email.indexOf('@')
                        == -1 ? 'google.com' : (stored.email.substring(stored.email.indexOf('@') + 1, stored.email
                        .length))}`" target="_blank">email</a>. We&#39;ve sent you an email at {{ stored.email }}
                        that holds your recorded info and a link to our Stripe checkout.
                    </p>
                </class-anim-display-controller>
            </class-anim-display-controller>
        </class-anim-display-controller>
    </div>
</template>

<script>
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import ClassAnimDisplayController from '../../anim/class/ClassAnimDisplayController.vue';
    import ClickClassAnim from '../../anim/class/ClickClassAnim.vue'
    import ImageLoader from '../../image/ImageLoader.vue';
    import Parallax from '../../image/Parallax.vue';
    import PORTS from '@/assets/js/PORTS.js';
    import regions from '@/assets/js/regions.js';
    import transition_loader from '@/assets/js/transition_loader.js';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClassAnim,
            ClassAnimDisplayController,
            ClickClassAnim,
            ImageLoader,
            Parallax
        },

        props: {
            data: "",
            parentKey: "",
            parentIndex: "",
            priceMod: ""
        },

        data(){
            return {
                displayIndex: 0,
                //isInternational: false,
                transportationMethodPickup: false,
                fetchedShipping: 0,
                localizedPrice: 0,
                localizedShipping: 0,
                localizedTotal: 0,
                canadaRegions: [],
                usRegions: [],
                isInternational: false,
                transactionControllerPages: 3,
                stored: {
                    firstName: "Michael",
                    lastName: "Sinclair",
                    email: "michaelkevin.sinclair@gmail.com",

                    address: "197 Clearbrook Rd",
                    city: "Abbotsford",
                    areaCode: "V2T5X1"

                    /*
                    address: "1378 Ramona Dr",
                    city: "Thousand Oaks",
                    areaCode: "91320"
                    */
                },
                verificationPending: false
            }
        },

        watch: {
            data(){
                this.reset();
            }
        },

        methods: {
            selectShowcaseImage(index){
                this.displayIndex = index;
                this.$emit('image-showcased', {
                    name: this.data.itemInfo.name,
                    about: this.data.itemInfo.about,
                    imageURL: this.displayIndex < this.data.beforeImages.length ? this.data.beforeImages[this.displayIndex]
                        : this.data.afterImages[this.displayIndex - this.data.beforeImages.length]
                });
            },

            reset(){
                this.displayIndex = 0;
            },

            setTransportationMethodPickup(bool){
                this.transportationMethodPickup = bool;
                this.$refs[`radio-${!bool ? 'shipout' : 'pickup'}`].checked = "checked";
                if(!bool)
                    wait.millis(200, this.loadCountrySelect);
            },

            getTransportationLink(){
                if(this.$refs['radio-shipout'].checked)
                    return 1;
                else if(this.$refs['radio-shipout'].checked)
                    return 0;
            },

            checkoutItem(){
                if(!this.transportationMethodPickup)
                    this.countryRegions = this.canadaRegions;

                this.$refs['transaction-container'].toggle();
                wait.millis(50, () => {
                    if(this.$refs['radio-shipout'].checked)
                        this.transitionTransaction(0);
                    this.transitionTransaction(1);
                });
            },

            transitionBacktrack(){
                for(let i = 0; i < this.transactionControllerPages; i++){
                    let t = this.$refs[`transaction-controller-${i}`];
                    if(t.isToggled())
                        t.toggle();
                }
                
                this.$refs['transaction-container'].toggle();
                wait.millis(400, this.$refs['item-display'].toggle);
            },

            transitionTransaction(index){
                this.$refs[`transaction-opening-${index}`].toggle();
                this.$refs[`transaction-${index}`].toggle();
            },

            transactionOpeningClicked(index){
                this.$refs[`transaction-${index}`].toggle();
            },

            verifyInfo(){
                let info = {
                    email: this.stored.email,
                    firstName: this.stored.firstName,
                    lastName: this.stored.lastName,
                    phoneNumber: this.$refs['phone-number'].value,
                    location: {},
                    pckg: {}
                };

                if(!this.transportationMethodPickup){
                    info.location['address'] = this.$refs['address'].value;
                    info.location['city'] = this.$refs['city'].value;
                    info.location['areaCode'] = this.$refs['area-code'].value;

                    let regionIndex = this.$refs['country-regions'].selectedIndex;
                    if(this.isInternational){
                        info.location['region'] = regions.usRegions[regionIndex];
                        info.location['regionCode'] = regions.usRegionCodes[regionIndex];
                        info.location['countryCode'] = "US";
                    } else {
                        info.location['region'] = regions.canadaRegions[regionIndex];
                        info.location['regionCode'] = regions.canadaRegionCodes[regionIndex];
                        info.location['countryCode'] = "CA";
                    }
                }

                let validated = true;
                if(!info.email.includes('@') || (!info.email.includes('.ca') && !info.email.includes('.com')))
                    validated = false;
                else {
                    let validated = true;
                    for(const [key, value] of Object.entries(info))
                        if(!value || value.length == 0){
                            validated = false;
                            break;
                        }
                }

                if(!validated)
                    window.alert("All form values must be filled correctly.");
                else {
                    info['itemCategoryKey'] = this.parentKey;
                    info['itemIndex'] = this.parentIndex;
                    info['transportationMethodPickup'] = this.transportationMethodPickup;
                    info['priceMod'] = this.priceMod;
                    if(!this.transportationMethodPickup)
                        info.location['unitNumber'] = this.$refs['unit-number'].value;

                    this.verificationPending = true;
                    wait.millis(200, this.$refs['verify-info-request'].toggle);

                    console.log(info);
                    fetch(`${PORTS.SERVER}/transaction/purchase/begin_authentication`, PORTS.postOptions(info))
                    .then(res => res.json())
                    .then(data => console.log("tkey: " + data.authenticationTransactionKey))
                    .catch(err => {
                        if(err){
                            console.error(err);
                            window.alert("An error occurred.");
                        }
                    });
                }
            },

            interruptVerificationProcess(){
                //bro, good idea but this is NOT fluid
                if(this.verificationPending){
                    this.verificationPending = false;
                    this.$refs['verify-info-request'].toggle();
                }
            },

            loadCountrySelect(){
                this.$refs['country-select'].innerHTML = "";
                let options = [
                    document.createElement("option"),
                    document.createElement("option")
                ];
                options[0].innerHTML = "Canada";
                options[1].innerHTML = "United States";
                if(this.isInternational)
                    options[1].setAttribute('selected', true);

                for(let option of options)
                    this.$refs['country-select'].appendChild(option);
            },

            updateCountry(){
                let isInternational = this.$refs['country-select'].selectedIndex != 0;
                this.$emit('update-country', { isInternational: isInternational });
                this.isInternational = isInternational;
            }
        },

        mounted(){
            this.reset();
            this.$refs['radio-shipout'].checked = "checked";
            if(window.location.href.includes('/us') || this.priceMod != 1.0)
                this.isInternational = true;
            this.loadCountrySelect();

            this.canadaRegions = regions.canadaRegions;
            this.usRegions = regions.usRegions;
            wait.millis(100, () => {
                if(this.$refs['showcase-info'])
                    transition_loader.loadElement(this.$refs['showcase-info']);
                transition_loader.loadElement(this.$refs['all-showcase-images']);
            });
            window.addEventListener("keypress", this.cheatCodeKeyPress);
        }
    }
</script>

<style>
    .checkout-button{
        border: solid black 1pt;
        background-color: rgb(91, 6, 22);
        box-shadow: 1px 2px 4px black;
        font-size: 18pt;
        color: white;
    }

    .transaction{
        opacity: 0;
        margin-left: -8pt;
    }

    .transaction-anim{
        opacity: 1;
        margin-left: 0;
    }

    .transaction p, .transaction-anim p{
        padding: 20pt;
    }

    .transaction-opening, .transaction-opening-anim{
        color: #4b4b4b;
        text-align: left;
        cursor: pointer;
    }

    .transaction-opening:active, .transaction-opening:visited, .transaction-opening:hover,
    .transaction-opening-anim:active, .transaction-opening-anim:visited,
    .transaction-opening-anim:hover{
        color: #252525;
    }

    .transaction-controller-label{
        padding-left: 8pt;
        padding-right: 8pt;
        background-color: #fdeed5;
    }

    .transaction-opening hr, .transaction-opening-anim hr{
        height: 1px;
        background-color: #4b4b4b;
        border: none;
        display: block;
        margin: 18pt 8pt -10pt 0;
    }

    .tc-opening{
        display: inline-block;
    }

    .transaction-opening-anim .tc-opening{
        transform: rotate(90deg);
    }

    .verify-info-request, .verify-info-request-anim{
        opacity: 0;
        pointer-events: none;
    }

    .verify-info-request-anim{
        opacity: 1;
        pointer-events: auto;
    }

    /*
    .verify-info-request p, .verify-info-request-anim p{
        padding: 12pt;
        margin: 12pt;
        background-color: #ffe1ad;
        font-family: Inter, sans-serif;
        border-radius: 12pt;
        overflow-wrap: break-word;
        font-size: 14pt;
    }
    */

    .transaction-container input, .transaction-container-anim input{
        width: 200pt;
    }

    .transaction-container select, .transaction-container .transaction-button,
    .transaction-container-anim select, .transaction-container-anim .transaction-button{
        width: 206pt;
    }

    .transaction-button{
        margin-top: 12pt;
    }

    .transaction-button-label{
        margin-top: -3pt;
    }

    .transaction-container input, .transaction-container-anim input{
        height: 16pt;
        margin-bottom: 6pt;
    }

    .item{
        text-align: center;
    }

    #showcase-image-selected{
        border: solid rgb(25, 25, 25) 2pt;
    }

    .showcase-image-container{
        transition: 0.2s;
        width: 60pt;
        height: 60pt;
        display: inline-block;
        border-radius: 4pt;
        box-shadow: 0;
    }

    .showcase-image-container:hover, .showcase-image-container:active, .showcase-image-container:visited{
        box-shadow: 1px 2px 4px rgb(50, 50, 50);
    }

    .showcase-images .showcase-image-container{
        margin-left: 2pt;
        margin-right: 2pt;
        cursor: pointer;
    }

    .showcase-images .showcase-image-container:first-child{
        margin-left: 0;
    }

    .showcase-images .showcase-image-container:last-child{
        margin-right: 0;
    }

    #all-showcase-images, .showcase-info{
        display: inline-block;
    }

    .showcase-info{
        position: relative;
        bottom: 18pt;
    }

    .checkout-button{
        cursor: pointer;
        width: 200pt;
        border: solid black 1pt;
        background-color: rgb(91, 6, 22);
        color: white;
        box-shadow: 1px 2px 4px black;
    }

    .checkout-button{
        padding: 18pt 0;
        margin: 20pt 25pt 12pt 25pt;
        position: relative;
        top: 12pt;
    }

    .checkout-button:hover, .checkout-button:active, .checkout-button:visited{
        box-shadow: 2px 4px 8px black;
    }

    .checkout-button img{
        width: 30pt;
        position: absolute;
        transform: translate(-50%, -50%);
    }

    .radio-label-group{
        display: inline-block;
    }

    @media only screen and (max-width: 1024px){
        .transaction-container, .transaction-container-anim{
            margin-top: -6pt;
        }

        .checkout-button{
            width: calc(100% - 100pt);
            margin-left: 0;
            margin-right: 0;
        }

        #all-showcase-images, .showcase-info{
            display: block;
        }

        .showcase-info{
            position: static;
        }
    }

    @media only screen and (min-width: 1025px){
        .transaction p, .transaction-anim p{
            padding: 8pt 25% 0 25%;
        }
    }
</style>