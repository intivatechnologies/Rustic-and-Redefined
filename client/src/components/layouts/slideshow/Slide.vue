<template>
    <class-controller target-class="slide" ref="slide" :style="zIndexAttr">
        <parallax :path="path" :bg-x="bgX" :shield-opacity="shieldOpacity"
            :offset="parentOffset" :running="parallaxRunning" ref="parallax">
            <slot></slot>
        </parallax>
    </class-controller>
</template>

<script>
    import ClassController from '../../anim/class/ClassController.vue';
    import Parallax from '../../image/Parallax.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClassController,
            Parallax
        },

        props: {
            path: "",
            bgX: "",
            shieldOpacity: "",

            identifier: "",
            zIndex: "",
            parentSlide: "",
            parentOffset: {}
        },

        data(){
            return {
                pIdentifier: 0,
                pZIndex: 0,
                initZIndex: 0,
                parallaxRunning: false
            }
        },

        watch: {
            parentSlide(){
                this.testToggle();
            }
        },

        methods: {
            testToggle(){
                if(this.pIdentifier == this.parentSlide){
                    this.pZIndex = this.initZIndex;
                    this.$refs['parallax'].setTransitionMode(true);
                    wait.millis(50, () => {
                        this.$refs['slide'].toggleUp();
                        this.parallaxRunning = "true";
                    });
                    wait.millis(400, this.$refs['slide'].toggleUp);
                    wait.millis(425, () => { this.$refs['parallax'].setTransitionMode(false); });
                } else if(this.$refs['slide'].getToggleLevel() == 2){
                    this.$refs['parallax'].setTransitionMode(true);
                    wait.millis(100, this.$refs['slide'].toggleDown);
                    wait.millis(400, () => {
                        this.$refs['slide'].toggleDown();
                        this.parallaxRunning = "false";
                    });
                    wait.millis(425, () => this.$refs['parallax'].setTransitionMode(false));
                    this.pZIndex = 0;
                }
            }
        },

        computed: {
            zIndexAttr(){
                return `z-index: ${this.pZIndex}`;
            }
        },

        mounted(){
            this.pIdentifier = Number(this.identifier);
            this.pZIndex = this.zIndex;
            this.initZIndex = this.pZIndex;

            if(this.pIdentifier == 0)
                this.testToggle();
        }
    }
</script>

<style>
    .slide{
        position: absolute;
        transform: rotate(0deg);
        width: 100%;
        height: inherit;
    }

    .slide.ext-0 .parallax, .slide.ext-1 .parallax, .slide.ext-2 .parallax{
        margin-left: -100%;
    }

    .slide.ext-1 .parallax, .slide.ext-2 .parallax{
        margin-left: 0;
    }

    .slide.ext-0 .parallax-content, .slide.ext-1 .parallax-content, .slide.ext-2 .parallax-content{
        margin-left: -100%;
        opacity: 0;
    }

    .slide.ext-1 .parallax-content, .slide.ext-2 .parallax-content{
        margin-left: -8pt;
    }

    .slide.ext-2 .parallax-content{
        margin-left: 0;
        opacity: 1;
    }
</style>