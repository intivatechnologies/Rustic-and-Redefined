<template>
    <div :class="transitionAttr" :style="background.attr" ref="parallax">
        <div class="parallax-shield transition" :style="shieldOpacityAttr"></div>
        <div class="parallax-content transition">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import Path from '../Path.vue';
    import transition_loader from '@/assets/js/transition_loader';
    import wait from '@/assets/js/wait.js';

    export default {
        extends: Path,

        props: {
            bgX: "",
            bgY: "",
            shieldOpacity: "",
            offset: "",
            running: false
        },

        data(){
            return {
                shouldTransition: false,
                isProcessing: false,
                pOffset: {
                    pos: [0, 0],
                    dims: [0, 0]
                },
                background: {
                    attr: "",
                    position: [50, 50],
                    tracker: undefined
                },
                scroll: {
                    offset: 0,
                    positionY: 0,
                    SPEED_MOD: 18
                },
                cursor: {
                    flag: false,
                    fixed: [0, 0],
                    position: [0, 0],
                    locator: [0, 0],
                    SPEED_MOD: [18, 3]
                }
            }
        },

        watch: {
            running(){
                this.requestProcess();
            },

            offset(){
                this.pOffset = this.offset;
            },

            processedPath(){
                this.updateBackgroundAttr([0, 0]);
            }
        },

        methods: {
            setTransitionMode(shouldTransition){
                this.shouldTransition = shouldTransition;
            },

            locateCursorEvent(x, y){
                if(this.cursor.flag){
                    this.cursor.flag = false;
                    this.cursor.fixed = [x, y];
                }

                this.cursor.position = [x, y];
            },

            locateCursorTrigger(ev){
                this.locateCursorEvent(ev.pageX, ev.pageY);
            },

            locateScroll(ev){
                this.cursor.position[1] += (window.scrollY - this.scroll.positionY);
                this.scroll.positionY = window.scrollY;
            },

            updateBackgroundAttr(locatorList){
                this.background.attr = `background-image: url(${this.processedPath});`
                    + ` background-position: ${(this.background.position[0] + locatorList[0])}%`
                    + ` ${(this.background.position[1] + this.scroll.offset + locatorList[1])}%`;
            },

            clearProcess(){
                window.clearInterval(this.background.tracker);
                window.removeEventListener("mousemove", this.locateCursorTrigger);
                window.removeEventListener("scroll", this.locateScroll);
            },

            requestProcess(){
                let process = () => {
                    if(!this.isProcessing && screen.availWidth >= 1025){
                        this.isProcessing = true;
                        this.cursor.flag = true;
                        this.background.tracker = window.setInterval(() => {
                            //running is only considered in a desktop setting
                            if(window.innerWidth > 1025 && this.running && this.running != "false"){
                                this.scroll.offset = -((window.scrollY - this.pOffset.pos[1])
                                    * this.scroll.SPEED_MOD / this.pOffset.dims[1]);

                                let locatorList = [];
                                for(let axis = 0; axis < 2; axis++)
                                    locatorList.push((this.cursor.position[axis] - this.cursor.fixed[axis])
                                        * this.cursor.SPEED_MOD[axis] / this.pOffset.dims[axis]);
                                this.updateBackgroundAttr(locatorList);
                            }
                        }, 25);
                        window.addEventListener("mousemove", this.locateCursorTrigger);
                        window.addEventListener("scroll", this.locateScroll);
                    } else if(this.isProcessing && screen.availWidth < 1025){
                        this.isProcessing = false;
                        this.clearProcess();
                    }
                };
                process();
                window.addEventListener("resize", process);
            }
        },

        computed: {
            shieldOpacityAttr(){
                return `opacity: ${this.shieldOpacity}`;
            },

            transitionAttr(){
                return `parallax${this.shouldTransition ? " default-transition" : ""}`;
            }
        },

        mounted(){
            wait.millis(100, () => {
                transition_loader.loadElement(this.$refs['parallax'].getElementsByClassName('parallax-shield')[0]);
                transition_loader.loadElement(this.$refs['parallax'].getElementsByClassName('parallax-content')[0]);
            });

            if(this.bgX)
                this.background.position[0] = Number(this.bgX);
            if(this.bgY)
                this.background.position[1] = Number(this.bgY);
            if(this.offset)
                this.pOffset = this.offset;
            
            this.background.attr = `background-image: url(${this.processedPath});`
                + ` background-position: ${this.background.position[0]}% ${this.background.position[1]}%`
            this.requestProcess();
        },

        beforeUnmount(){
            if(this.isProcessing && screen.availWidth < 1025)
                this.clearProcess();
        }
    }
</script>

<style>
    .parallax, .parallax-shield{
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .parallax{
        background-repeat: none;
        background-size: cover;
    }

    .parallax h1, .parallax h2, .parallax h3, .parallax h4, .parallax h5, .parallax h6{
        font-family: 'Special Elite', sans-serif;
    }

    .parallax p{
        font-family: 'Archive Narrow', sans-serif;
        font-weight: 600;
        font-size: 16pt;
    }

    .parallax-shield{
        position: absolute;
        background-color: black;
    }

    .parallax-content{
        position: relative;
        text-align: center;
        color: white;
        top: 50%;
        transform: translateY(-50%);
        padding: 0 15pt 0 15pt;
    }

    .parallax-content img{
        width: 180pt;
        margin-bottom: 28pt;
    }

    .parallax-content a.button{
        color: white;
        font-size: 16pt;
        margin-top: 24pt;
    }

    @media only screen and (min-width: 385px){
        .parallax{
            font-size: 16pt;
        }

        .parallax-content img{
            width: 200pt;
        }

        .parallax-content a.button{
            font-size: 18pt;
        }
    }

    @media only screen and (orientation: landscape){
        .parallax{
            font-size: 12pt;
        }

        .parallax-content{
            padding: 0 40pt 0 40pt;
        }

        .parallax-content img{
            width: 140pt;
            margin-bottom: 18pt;
        }

        .parallax a.button{
            font-size: 16pt;
        }

        @media only screen and (min-width: 820px){
            .parallax{
                font-size: 14pt;
            }
    
            .parallax a.button{
                font-size: 16pt;
            }
    
            .parallax-content img{
                width: 225px;
                margin-bottom: 15pt;
            }
        }

        @media only screen and (min-width: 1025px){
            .parallax{
                background-size: 105% auto;
                font-size: 16pt;
            }

            .parallax p{
                font-size: 18pt;
                padding: 0 20% 0 20%;
            }

            .parallax-content a.button{
                font-size: 20pt;
                margin-top: 52pt;
            }

            .parallax-content img{
                margin-top: -24pt;
                margin-bottom: 52pt;
                width: 200pt;
            }
        }
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        .parallax{
            font-size: 24pt;
        }

        .parallax p{
            font-size: 26pt;
            padding: 0 10% 0 10%;
        }

        .parallax-content a.button{
            font-size: 32pt;
            margin-top: 52pt;
        }

        .parallax-content img{
            margin-top: -24pt;
            margin-bottom: 72pt;
            width: 280pt;
        }
    }
</style>