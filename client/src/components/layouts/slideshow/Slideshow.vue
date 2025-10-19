<template>
    <height-override :override-height="overrideHeight" :id="name" alternate-classes="slideshow" ref="slideshow">
        <slot></slot>
        <image-loader path="icon/arrow.png" alt-value="Next Slide" class="slideshow-arrow" />
        <click-class-anim target-class="arrow-bg-container" ref="arrow-bg-container" @toggled="toggleArrow">
            <image-loader path="icon/arrow-bg.png" alt-value="Next Slide" class="slideshow-arrow arrow-bg" />
        </click-class-anim>
    </height-override>
</template>

<script>
    import ClickClassAnim from '../../anim/class/ClickClassAnim.vue';
    import HeightOverride from '../HeightOverride.vue';
    import ImageLoader from '../../image/ImageLoader.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClickClassAnim,
            HeightOverride,
            ImageLoader
        },

        props: {
            overrideHeight: "",
            slideCap: "",
            name: ""
        },

        data(){
            return {
                pSlideCap: 0,
                arrowTop: 0,
                arrowAnimating: false,
                curSlide: 0
            }
        },

        methods: {
            emitToggle(){
                this.$emit('toggle-slide', {
                    slide: this.curSlide,
                    slideshowName: this.name
                });
            },

            toggleArrow(){
                if(!this.arrowAnimating){
                    this.arrowAnimating = true;
                    let abc = this.$refs['arrow-bg-container'];
                    if(abc.isToggled()){
                        wait.millis(200, () => {
                            if(abc.isToggled())
                                abc.togglePrivate();
                        });
                    }

                    //toggle slideshow
                    if(++this.curSlide >= this.slideCap)
                        this.curSlide = 0;
                    
                    this.emitToggle();
                    wait.millis(400, () => { this.arrowAnimating = false; });
                }
            }
        },

        mounted(){
            this.pSlideCap = Number(this.slideCap);
            wait.millis(50, () => {
                let s = this.$refs['slideshow'].$el;
                this.$emit('slideshow-offset', {
                    slideshowName: this.name,
                    offset: {
                        pos: [
                            s.offsetLeft,
                            s.offsetTop
                        ],
                        dims: [
                            s.offsetWidth,
                            s.offsetHeight
                        ]
                    }
                });
            });
        }
    }
</script>

<style>
    .slideshow-arrow{
        transition: 0.2s;
        position: absolute;
        right: 10pt;
        width: 35pt;
        margin-top: 10pt;
        cursor: pointer;
        z-index: 9;
    }

    .arrow-bg-container .arrow-bg, .arrow-bg-container-anim .arrow-bg{
        opacity: 0;
    }

    .arrow-bg-container-anim .arrow-bg{
        opacity: 0.4;
    }

    @media only screen and (orientation: landscape){
        .slideshow-arrow{
            width: 32pt;
        }

        @media only screen and (min-width: 820px){
            .slideshow-arrow{
                width: 36pt;
            }
        }
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        .slideshow-arrow{
            width: 52pt;
        }
    }

    @media only screen and (min-width: 1025px){
        .arrow-bg:hover, .arrow-bg:active{
            opacity: 0.2;
        }

        .arrow-bg-container-anim .arrow-bg:hover, .arrow-bg-container-anim .arrow-bg:active{
            opacity: 0.5;
        }
    }
</style>