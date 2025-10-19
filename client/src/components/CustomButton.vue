<template>
    <router-link :to="to" class="button" ref="button">
        <span class="button-bg" :style="dimensionsAttr"></span>
        <slot></slot>
    </router-link>
</template>

<script>
    import wait from '@/assets/js/wait.js';

    export default {
        props: {
            to: ""
        },

        data(){
            return {
                bgWidth: 0,
                bgHeight: 0
            }
        },

        methods: {
            locateBgDimensions(){
                this.bgWidth = this.$refs['button'].$el.offsetWidth - 4;
                this.bgHeight = this.$refs['button'].$el.offsetHeight - 4;
            },

            locateBgDimensionsDelayed(){
                wait.millis(100, this.locateBgDimensions)
            }
        },

        computed: {
            dimensionsAttr(){
                return `width: ${this.bgWidth}px; height: ${this.bgHeight}px`;
            }
        },

        mounted(){
            wait.millis(400, this.locateBgDimensions);
            window.addEventListener("resize", this.locateBgDimensionsDelayed);
        },

        beforeUnmount(){
            window.removeEventListener("resize", this.locateBgDimensionsDelayed);
        }
    }
</script>

<style>
    a.button{
        margin-top: 12pt;
    }

    a.button:link, a.button:hover, a.button:active, a.button:visited{
        cursor: pointer;
        border: solid white 2pt;
        display: inline-block;
        padding: 4pt 8pt 6pt 8pt;
        text-decoration: none;
    }

    .button-bg{
        transition: 0.2s;
        margin-top: -4pt;
        margin-left: -8pt;
        position: absolute;
        background-color: rgba(255, 255, 255, 0.3);
        clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
    }

    a.button:hover .button-bg, a.button:active .button-bg{
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        a.button:link, a.button:hover, a.button:active, a.button:visited{
            padding: 6pt 10pt 8pt 10pt;
        }

        .button-bg{
            margin-top: -6pt;
            margin-left: -10pt;
        }
    }
</style>