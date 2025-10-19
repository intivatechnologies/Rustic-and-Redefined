<template>
    <div class="page-content">
        <chat-controller />

        <slideshow override-height="true" slide-cap="3" name="splash"
            @toggle-slide="emitToggle" @slideshow-offset="emitSlideshowOffset">
            <slide path="background/oil.jpg" bg-x="60" shield-opacity="0.35" identifier="0" z-index="2"
                :parent-slide="slideshows.splash.slide" :parent-offset="slideshows.splash.offset">
                <image-loader path="logo/logo_title.png" alt-value="Rustic And Redefined" />
                <h2>We now handle shipping across Canada and the U.S.!</h2>
                <custom-button to="/shop">
                    Our Products
                </custom-button>
            </slide>
            <slide path="background/station.jpg" bg-x="60" shield-opacity="0.45" identifier="1" z-index="1"
                :parent-slide="slideshows.splash.slide" :parent-offset="slideshows.splash.offset">
                <h2>We take antiques and apply our design!</h2>
                <custom-button to="/projects">
                    Our Projects
                </custom-button>
            </slide>
            <slide path="background/vehicle.jpg" bg-x="60" shield-opacity="0.35" identifier="2" z-index="0"
                :parent-slide="slideshows.splash.slide" :parent-offset="slideshows.splash.offset">
                <h2>We&#39;re open to custom projects.</h2>
                <custom-button to="/contact">
                    Inquire
                </custom-button>
            </slide>
        </slideshow>

        <class-anim target-class="nav-links-overlay" alternate-classes="transition" ref="nav-links-overlay">
            <navigate-links :admin-logged="adminLogged" />
        </class-anim>

        <offset-navbar :admin-logged="adminLogged" />

        <horizontal-section>
            <template v-slot:big>
                <h1>We&#39;re Passionate About Antiques</h1>
                <p>
                    We take antiques that in some cases have outlasted the decade and rebuild them as
                    prize collections with modern style!
                    <span class="mobile-only">See some of our prized reinventions below.</span>
                </p>
            </template>
            <template v-slot:small>
                <before-after before-path="antique/before.jpg" after-path="antique/after.jpg" />
            </template>
        </horizontal-section>

        <horizontal-section small-left="true" id="below-horizontal">
            <template v-slot:big>
                <h1>Got Something in Mind?</h1>
                <p>
                    We sell not only our own product line but are also open to restoring <i>your</i> antique
                    into something unique and creative, and yes, we may just be able to source your product
                    on our shop! Have a monument that you just can&#39;t get our of your garage? Give
                    us a call, we can help with that.
                </p>
            </template>
            <template v-slot:small>
                <before-after before-path="antique/pump_cropped.jpg" after-path="antique/pump_after.jpg"
                    tall-landscape-mirrored="true" />
            </template>
        </horizontal-section>
        
        <slideshow name="moreProjects" slide-cap="2"
            @toggle-slide="emitToggle" @slideshow-offset="emitSlideshowOffset">
            <slide path="background/pocket_watch.jpg" shield-opacity="0.45" identifier="0" z-index="1"
                :parent-slide="slideshows.moreProjects.slide" :parent-offset="slideshows.moreProjects.offset">
                <h2>We source in projects from other vendors!</h2>
                <custom-button to="/shop">
                    Our Products
                </custom-button>
            </slide>
            <slide path="background/clock.jpg" shield-opacity="0.4" bg-x="25" identifier="1" z-index="0"
                :parent-slide="slideshows.moreProjects.slide" :parent-offset="slideshows.moreProjects.offset">
                <div class="img-link">
                    <image-chooser path="logo/logo_cut.png" alt="Rustic &#amp; Redefined" />
                </div>
                <custom-button to="/projects">
                    Our Past Work
                </custom-button>
            </slide>
        </slideshow>

        <footer-intiva />
    </div>
</template>

<script>
    import BeforeAfter from '../BeforeAfter.vue';
    import ChatController from '../chat/ChatController.vue';
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import CustomButton from '../../CustomButton.vue';
    import FooterIntiva from '../FooterIntiva.vue';
    import HorizontalSection from '../HorizontalSection.vue';
    import ImageChooser from '../../image/ImageChooser.vue';
    import ImageLoader from '../../image/ImageLoader.vue';
    import NavigateLinks from '../nav/NavigateLinks.vue';
    import Page from './Page.vue';
    import Parallax from '../../image/Parallax.vue';
    import PORTS from '@/assets/js/PORTS';
    import OffsetNavbar from '../nav/OffsetNavbar.vue';
    import { RouterLink } from 'vue-router';
    import SlideshowMixin from '../slideshow/SlideshowMixin.vue';
    import transition_loader from '@/assets/js/transition_loader.js';
    import wait from '@/assets/js/wait.js';

    export default {
        extends: Page,

        mixins: [ SlideshowMixin ],

        components: {
            BeforeAfter,
            ChatController,
            ClassAnim,
            CustomButton,
            FooterIntiva,
            HorizontalSection,
            ImageChooser,
            ImageLoader,
            NavigateLinks,
            Parallax,
            OffsetNavbar,
            RouterLink
        },

        data(){
            return {
                overlayToggled: false,
                adminLogged: false
            }
        },

        methods: {
            testOverlay(){
                if((!this.overlayToggled && screen.availWidth >= 1025)
                    || (this.overlayToggled && screen.availWidth < 1025)){
                    this.overlayToggled = !this.overlayToggled;

                    //uses delay to activate transition
                    wait.millis(this.$refs['nav-links-overlay'].isToggled() ? 100 : 0,
                        this.$refs['nav-links-overlay'].toggle);
                }
            }
        },

        mounted(){
            transition_loader.loadElement(this.$refs['nav-links-overlay'].$el);
            wait.millis(200, this.testOverlay);
            window.addEventListener("resize", this.testOverlay);

            let loginId = localStorage.getItem('loginId');
            fetch(`${PORTS.SERVER}/dashboard/authentication/${loginId}`)
                .then(res => res.json())
                .then(data => { this.adminLogged = data.authentic; });
        },

        beforeUnmount(){
            window.removeEventListener("resize", this.testOverlay);
        }
    }
</script>

<style>
    #below-horizontal{
        background-color: rgb(25, 25, 25);
        color: rgb(245, 245, 245);
        font-weight: 300;
    }

    #moreProjects {
        height: 400pt;
    }

    .nav-links-overlay, .nav-links-overlay-anim{
        display: none;
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        #moreProjects .parallax-content img{
            margin-top: 0;
            margin-bottom: 0;
            width: 230pt;
        }
    }

    @media only screen and (min-width: 1025px){
        #moreProjects .img-link{
            margin-bottom: -40pt;
        }

        .nav-links-overlay, .nav-links-overlay-anim{
            display: block;
            position: absolute;
            top: 0;
            left: 40%;
            width: 40%;
            height: 100%;
            margin-left: -5pt;
            opacity: 0.0;
            pointer-events: none;
            background: rgba(91, 6, 22, 0.5);
            text-align: center;
            z-index: 8;
        }
    
        .nav-links-overlay-anim{
            left: 60%;
            margin-left: 0;
            opacity: 1.0;
            pointer-events: auto;
        }
    
        .nav-links-overlay .nav-links, .nav-links-overlay-anim .nav-links{
            position: relative;
            top: 50%;
            transform: translateY(-50%);
        }
    
        .nav-links-overlay .nav-link, .nav-links-overlay-anim .nav-link{
            display: block;
            margin-bottom: 40pt;
            font-size: 20pt;
        }

        #splash .parallax-content{
            width: 60%;
            margin-left: 0;
            transform: translate(calc(-5% - 5pt), -50%);
        }
    }
</style>