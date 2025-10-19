<template>
    <div class="page-content fixed-navbar-support">
        <navbar position="fixed" :admin-logged="adminLoggedContact" />

        <div class="info">
            <p>
                We are a family-run business with 40 years of experience restoring
                and redesigning antiques into something to be proud of. Although we
                don&#39;t currently have a public facility, we are available to ship
                our product across Canada and the U.S. Check out below to make an
                inquiry!
            </p>
        </div>

        <div id="black-banner-faq" ref="black-banner">
            <div id="faq">
                <div class="aq">
                    <div class="question">
                        <h3>Is there any warranty available for your product?</h3>
                    </div>
                    <div class="answer">
                        <p>Only for damages that could be accumulated from our shipping.</p>
                    </div>
                </div>
                <div class="aq">
                    <div class="question">
                        <h3>What is your policy for sourcing products through your website?</h3>
                    </div>
                    <div class="answer">
                        <p>Depending on the value of the product, I generally go for a X-X cut.</p>
                    </div>
                </div>
                <div class="aq">
                    <div class="question">
                        <h3>Do you offer product refunds?</h3>
                    </div>
                    <div class="answer">
                        <p>Refunds are taken at a lower value and are inquiry-based only.</p>
                    </div>
                </div>
            </div>

            <div id="contact-form" :style="contactFormTopAttr">
                <input type="text" placeholder="Your Name" ref="name-form" />
                <input type="email" placeholder="Your Email" ref="email-form" />
                <textarea placeholder="Your Message..." ref="message-form"></textarea>
                <input type="submit" value="Submit" ref="submit-form" />
            </div>
        </div>

        <div id="contact-parallax-container" ref="parallax-container">
            <parallax path="background/gas_redone.jpg" shield-opacity="0.3" running="true" :offset="parallaxOffset">
                <h3>Sign up for our newsletter!</h3><br />
                <input type="email" placeholder="Your Email" ref="input-news"
                    @keypress="ev => { if(ev.keyCode == 13) submitEmail() }" />
                <input type="submit" value="Submit" ref="submit-news" />
            </parallax>
        </div>

        <footer-intiva />
    </div>
</template>

<script>
    import '@/assets/css/standard_fixed_navbar.css';
    import FooterIntiva from '../FooterIntiva.vue';
    import HeightOverride from '../HeightOverride.vue';
    import ImageLoader from '../../image/ImageLoader.vue';
    import Inquiry from '@/assets/js/InquiryScript.js';
    import meta_properties from '@/assets/js/meta_properties.js';
    import Navbar from '../nav/Navbar.vue';
    import Page from './Page.vue';
    import Parallax from '../../image/Parallax.vue';
    import PORTS from '@/assets/js/PORTS.js';
    import { RouterLink } from 'vue-router';
    import wait from '@/assets/js/wait.js';

    export default {
        extends: Page,

        metaInfo: meta_properties.getInfo('Contact Us'),

        components: {
            FooterIntiva,
            HeightOverride,
            ImageLoader,
            Navbar,
            Parallax,
            RouterLink
        },

        data(){
            return {
                inquiry: undefined,
                contactFormTop: 0,
                parallaxOffset: {
                    pos: [0, 0],
                    dims: []
                },
                adminLoggedContact: false
            }
        },

        methods: {
            locateFormTop(){
                wait.millis(50, () => { this.contactFormTop = document.getElementById("black-banner-faq").offsetTop + 40 });
            },

            submitForm(){
                this.inquiry = new Inquiry(this.$refs['name-form'].value, this.$refs['email-form'].value,
                    this.$refs['message-form'].value);
                
                if(!this.inquiry.submit()){
                    window.alert("Please fill out the form with valid values before making a submission.");
                    return;
                } else {
                    this.$refs['name-form'].value = "Uploading submission...";
                    this.$refs['email-form'].value = "Uploading submission...";
                    this.$refs['message-form'].value = "Uploading submission...";

                    let data = this.inquiry.getData();
                    let waitCount = 0;
                    let waitInterval = window.setInterval(() => {
                        if(this.inquiry.isStatusComplete()){
                            window.clearInterval(waitInterval);
                            window.alert("Submission successful.");
                            this.$refs['name-form'].value = data.name;
                            this.$refs['email-form'].value = data.email;
                            this.$refs['message-form'].value = data.messages[0];
                            return;
                        }

                        if(waitCount++ * 200 >= 2600){
                            window.clearInterval(waitInterval);
                            window.alert("Message failed to send. Please ensure your Wi-Fi is activated.");
                        }
                    }, 200);
                }
            },

            submitEmail(){
                if(!this.$refs['input-news'].value.includes('@'))
                    window.alert('Please input a valid email before making a submission.');
                else {
                    fetch(`${PORTS.SERVER}/newsletter/request_subscription`, {
                        method: "POST",
                        body: JSON.stringify({ email: this.$refs['input-news'].value }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        this.$refs['input-news'].value = '';
                        if(data.code === 'already-verified')
                            window.alert("You are already subscribed :)!");
                        else
                            window.alert("A verification request has been sent to your email.\n\n"
                                + "Please note: The newsletter will only activate once you have verified.");
                    });
                }
            }
        },

        computed: {
            contactFormTopAttr(){
                return `top: ${this.contactFormTop}px`;
            }
        },

        mounted(){
            this.locateFormTop();
            this.parallaxOffset.pos[1] = this.$refs['parallax-container'].offsetTop;
            this.parallaxOffset.dims = [
                this.$refs['parallax-container'].offsetWidth,
                this.$refs['parallax-container'].offsetHeight
            ];

            this.$refs['submit-form'].addEventListener("click", this.submitForm);
            this.$refs['submit-news'].addEventListener("click", this.submitEmail);
            window.addEventListener("resize", this.locateFormTop);

            let loginId = localStorage.getItem('loginId');
            fetch(`${PORTS.SERVER}/dashboard/authentication/${loginId}`)
                .then(res => res.json())
                .then(data => { this.adminLoggedContact = data.authentic; });
        },

        beforeUnmount(){
            this.$refs['submit-form'].removeEventListener("click", this.submitForm);
            this.$refs['submit-news'].removeEventListener("click", this.submitEmail);
            window.addEventListener("resize", this.locateFormTop);
        }
    }
</script>

<style>
    #black-banner-faq{
        background-color: black;
        color: white;
        padding-bottom: 20pt;
    }

    #faq{
        padding: 20pt;
    }

    #contact-form{
        width: calc(100% - 40pt);
        margin-left: 20pt;
    }

    #contact-form input[type=text], #contact-form input[type=email], #contact-form textarea{
        font-family: Inter, sans-serif;
        display: block;
        margin-bottom: 16pt;
        width: 100%;
        resize: none;
    }

    #contact-form textarea{
        height: 7em;
    }

    #contact-form input[type=text], #contact-form input[type=email]{
        width: 100%;
        height: 18pt;
    }

    #contact-parallax-container{
        height: 300pt;
    }

    #contact-parallax-container input[type=email]{
        width: 145pt;
        height: 20pt;
        border: solid grey 1pt;
        border-right: 0;
    }

    #contact-parallax-container input[type=email]:focus{
        outline: 0;
    }

    #contact-form input[type=submit], #contact-parallax-container input[type=submit]{
        width: 50pt;
        height: 22pt;
        border: solid grey 1pt;
    }

    #contact-parallax-container input[type=submit]{
        background-color: rgb(25, 25, 25);
        color: white;
        margin-left: -4pt;
    }

    @media only screen and (min-width: 1025px){
        #black-banner-faq{
            padding-bottom: 0;
        }

        #faq{
            width: calc(50% - 20pt);
        }

        #contact-form{
            position: absolute;
            width: calc(50% - 25pt);
            left: 50%;
        }

        #contact-form input[type=text], #contact-form input[type=email], #contact-form textarea{
            width: calc(100% - 40pt);
        }

        #contact-form input[type=submit]{
            width: 80pt;
            cursor: pointer;
        }

        #contact-parallax-container input[type=email]{
            width: 170pt;
            height: 28pt;
        }

        #contact-parallax-container input[type=submit]{
            width: 60pt;
            height: 31pt;
            cursor: pointer;
        }
    }
</style>