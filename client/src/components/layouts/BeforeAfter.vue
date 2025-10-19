<template>
    <scroll-class-controller portrait-triggers="[150, 280, 900, 600, 600, 600]"
        landscape-triggers="[-125, 125, 600, 600, 600, 600]"
        target-class="before-after" ref="controller">
        <div class="before transition" ref="before">
            <parallax :path="beforePath" :shield-opacity="shieldOpacity">
                <h2 class="caption">Before</h2>
            </parallax>
        </div>
        <div class="after transition" :style="landscapeAttr">
            <parallax :path="afterPath" :shield-opacity="shieldOpacity">
                <h2 class="caption">After</h2>
            </parallax>
        </div>
    </scroll-class-controller>
</template>

<script>
    import Parallax from '../image/Parallax.vue';
    import ScrollClassController from '../anim/class/ScrollClassController.vue';
    import transition_loader from '@/assets/js/transition_loader';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            Parallax,
            ScrollClassController
        },

        props: {
            beforePath: "",
            afterPath: "",
            tallLandscapeMirrored: ""//flips transition to move to right
        },

        data(){
            return {
                OPACITY_CAP: 0.3,
                shieldOpacity: 0,
                isSmallLandscape: false,
                isTallLandscape: false,
                beforeTop: 0,
                currentExtension: 0
            }
        },

        methods: {
            locateParent(){
                wait.millis(425, () => {
                    this.isSmallLandscape = screen.availWidth >= 750 && screen.availWidth < 1025;
                    this.isTallLandscape = screen.availWidth >= 1025;
                    this.beforeTop = this.$refs['before'].offsetTop;
                });
            },

            setShieldState(invisible = true){
                this.currentExtension = this.$refs['controller'].getExtension();//misc that gets called at each task protocol
                this.shieldOpacity = invisible ? 0 : this.OPACITY_CAP;
            }
        },

        computed: {
            landscapeAttr(){
                let mult = !this.tallLandscapeMirrored ? -1 : 1;
                return this.isSmallLandscape ? `top: ${this.beforeTop}px`
                    : (this.isTallLandscape ? `margin-left: ${this.currentExtension > 0 ? mult * 200 : 0}pt` : "");
            }
        },

        mounted(){
            this.locateParent();
            window.addEventListener("resize", this.locateParent);

            let c = this.$refs['controller'];
            transition_loader.loadElement(c.$el.getElementsByClassName('before')[0]);
            transition_loader.loadElement(c.$el.getElementsByClassName('after')[0]);

            c.setTaskProtocol(0, this.setShieldState);

            c.setTaskProtocol(1, () => {
                this.setShieldState(false);

                wait.millis(400, () => {
                    if(!c.isToggleDownInitiated())
                        c.toggleUp();
                    else
                        c.toggleDown();
                });
            });

            c.setTaskProtocol(2, this.setShieldState);
        },

        beforeUnmount(){
            window.removeEventListener("resize", this.locateParent);
        }
    }
</script>

<style>
    .before-after{
        padding-bottom: 14pt;
    }

    .before, .after{
        width: 235pt;
        height: 313pt;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 12pt;
    }

    .before{
        box-shadow: none;
        z-index: 1;
    }

    .after{
        position: relative;
        bottom: 240pt;
    }

    .before-after .parallax{
        width: 100%;
        height: 100%;
    }

    .before-after.ext-1 .before, .before-after.ext-2 .before{
        box-shadow: 2px 4px 8px #888888;
        width: 245pt;
        height: 326pt;
    }

    .before-after.ext-2 .before{
        box-shadow: none;
        width: 235pt;
        height: 313pt;
    }

    .before-after.ext-1 .after, .before-after.ext-2 .after{
        bottom: 0;
    }

    .before-after.ext-2 .after{
        z-index: 0;
    }

    .before-after.ext-2 .parallax-content{
        opacity: 0;
        transition-delay: 0.4s;
    }

    .before-after.ext-2 .parallax-shield{
        transition-delay: 0.2s;
    }

    .before-after .caption{
        font-family: 'Archivo Narrow', sans-serif;
        pointer-events: none;
        transition: 0.4s;
        opacity: 0;
    }

    .before-after.ext-1 .caption{
        opacity: 1;
    }

    .before-after.ext-2 .caption{
        opacity: 0;
        transition-delay: 0.8s;
    }

    @media only screen and (min-width: 750px){
        .before-after{
            padding-bottom: 16pt;
        }

        .before, .after{
            transform: none;
            width: 200pt;
            height: 266pt;
        }

        .before{
            position: static;
            margin-left: 50%;
            transform: translateX(calc(-100% - 8pt));
        }

        .after{
            position: absolute;
            left: 50%;
            transform: translateX(calc(-100% - 9pt));
        }

        .before-after.ext-1 .before, .before-after.ext-2 .before{
            width: 215pt;
            height: 287pt;
        }

        .before-after.ext-2 .before{
            width: 200pt;
            height: 266pt;
        }

        .before-after.ext-1 .after, .before-after.ext-2 .after{
            transition-delay: 0.2s;
            left: calc(50% + 8pt);
            transform: none;
        }
    }

    @media only screen and (min-width: 1025px){
        .before-after{
            padding-bottom: 0;
        }

        .before, .after{
            margin-bottom: 0;
            transform: none;
            left: 0;
        }

        .before{
            margin-left: 0;
            transform: none;
            position: relative;
            z-index: 1;
        }

        .after{
            position: static;
            margin-top: -266pt;
        }

        .before-after.ext-1 .before, .before-after.ext-2 .before{
            width: 200pt;
            height: 266pt;
            box-shadow: none;
        }

        .before-after.ext-2 .caption{
            transition-delay: 1.2s;
        }
    }
</style>