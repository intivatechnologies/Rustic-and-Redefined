<template>
    <nav :class="positionClass">
        <class-anim target-class="nav-links-container" alternate-classes="transition" ref="nav-links-container">
            <router-link to="/">
                <image-loader path="logo/title_label.png" alt-value="Rustic &#amp; Redefined" class="portrait-only" />
            </router-link>
            <navigate-links :admin-logged="adminLogged" />
        </class-anim>
        <slot></slot><!--For alternate menus-->
        <hamburger @click="toggleNavbar" ref="hamburger" />
    </nav>
</template>

<script>
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import Hamburger from './Hamburger.vue';
    import ImageLoader from '../../image/ImageLoader.vue';
    import NavigateLinks from './NavigateLinks.vue';
    import { RouterLink } from 'vue-router';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClassAnim,
            Hamburger,
            ImageLoader,
            NavigateLinks,
            RouterLink
        },

        props: {
            block: "",
            position: "",
            adminLogged: ""
        },

        methods: {
            scrollPortrait(){
                if(window.innerWidth <= window.innerHeight){
                    if(this.$refs['hamburger'].isToggled())
                        this.$refs['hamburger'].toggle();
                    else if(this.$refs['nav-links-container'].isToggled())
                        this.$refs['nav-links-container'].toggle();
                }
            },

            scrollLandscape(){
                if(window.innerWidth > window.innerHeight){
                    if((!this.block && !this.$refs['nav-links-container'].isToggled())
                        || (this.block && this.$refs['nav-links-container'].isToggled()))
                        this.$refs['nav-links-container'].toggle();
                }
            },

            verifyOrientation(){
                this.scrollPortrait();
                this.scrollLandscape();
            },

            toggleNavbar(){
                this.$refs['nav-links-container'].toggle();
                this.$emit('toggled');
            }
        },

        computed: {
            positionClass(){
                return this.position == 'fixed' ? "nav-fixed" : "";
            }
        },

        mounted(){
            wait.millis(100, this.verifyOrientation);
            window.addEventListener("scroll", this.scrollPortrait);
            window.addEventListener("scroll", this.scrollLandscape);
            window.addEventListener("resize", this.verifyOrientation);
        },

        beforeUnmount(){
            window.removeEventListener("scroll", this.scrollPortrait);
            window.removeEventListener("scroll", this.scrollLandscape);
            window.removeEventListener("resize", this.verifyOrientation);
        }
    }
</script>

<style>
    nav{
        background-color: rgb(25, 25, 25);
        height: 52pt;
        text-align: center;
    }

    .nav-fixed{
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 10;
    }

    .nav-links-container, .nav-links-container-anim{
        font-size: 16pt;
        position: fixed;
        top: 0;
        margin-left: -72%;
        width: 72%;
        height: 100%;
        background-color: rgb(25, 25, 25);
        z-index: 10;
    }

    .nav-links-container-anim{
        margin-left: 0;
    }

    .nav-links-container img.portrait-only, .nav-links-container-anim img.portrait-only{
        width: 170pt;
        margin: 45pt 0 34pt 50%;
        position: relative;
        z-index: 10;
        transform: translateX(-50%);
    }

    .nav-links-container .nav-link, .nav-links-container-anim .nav-link{
        transition: 0.2s;
        opacity: 0;
        pointer-events: none;
        display: block;
        margin-bottom: 22pt;
    }

    .nav-links-container-anim .nav-link{
        transition-delay: 0.1s;
        opacity: 1;
        pointer-events: auto;
    }

    .hamburger, .hamburger-anim{
        position: absolute;
        right: 0;
        margin-top: 26pt;
        transform: translate(-50%, -50%);
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        nav{
            height: 68pt;
        }

        .hamburger, .hamburger-anim{
            margin-top: 34pt;
        }

        .nav-links-container, .nav-links-container-anim{
            font-size: 30pt;
        }

        .nav-links-container img.portrait-only, .nav-links-container-anim img.portrait-only{
            width: 150pt;
        }

        .nav-links-container .nav-link, .nav-links-container-anim .nav-link{
            margin-bottom: 30pt;
        }
    }

    @media only screen and (orientation: landscape){
        .nav-links-container, .nav-links-container-anim{
            position: static;
            width: 100%;
            height: auto;
            background: none;
        }

        .nav-links-container .nav-link, .nav-links-container-anim .nav-link{
            display: inline;
            margin-bottom: 0;
            margin-right: 16pt;
            position: relative;
            top: 14pt;
        }
    }
</style>