<template>
    <click-class-anim target-class="hamburger" ref="hamburger">
        <span class="ham-slot transition" id="ham-slot-1"></span>
        <span class="ham-slot transition" id="ham-slot-2"></span>
        <span class="ham-slot transition" id="ham-slot-3"></span>
    </click-class-anim>
</template>

<script>
    import ClickClassAnim from '../../anim/class/ClickClassAnim.vue';
    import transition_loader from '@/assets/js/transition_loader.js';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClickClassAnim
        },

        methods: {
            toggle(){
                this.$refs['hamburger'].toggle();
            },

            isToggled(){
                return this.$refs['hamburger'].isToggled();
            }
        },

        mounted(){
            wait.millis(100, () => {
                for(let el of this.$refs['hamburger'].$el.getElementsByClassName('ham-slot'))
                    transition_loader.loadElement(el);
            });
        }
    }
</script>

<style>
    .ham-slot{
        display: block;
        background-color: white;
        height: 3pt;
        width: 28pt;
        border-radius: 1pt;
        margin-bottom: 9pt;
    }

    .hamburger #ham-slot-3{
        margin-bottom: 0;
    }

    .hamburger-anim #ham-slot-1{
        transform: rotate(45deg);
        margin-top: 36pt;
    }

    .hamburger-anim #ham-slot-2{
        transform: rotate(-45deg);
        margin-top: -12pt;
    }

    .hamburger-anim #ham-slot-3{
        opacity: 0;
        margin-top: 20pt;
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        .ham-slot{
            height: 5pt;
            width: 38pt;
            margin-bottom: 11pt;
        }

        .hamburger-anim #ham-slot-1{
            margin-top: 37pt;
        }

        .hamburger-anim #ham-slot-2{
            margin-top: -16pt;
        }
    }

    @media only screen and (orientation: landscape) {
        .hamburger, .hamburger-anim{
            display: none;
        }
    }
</style>