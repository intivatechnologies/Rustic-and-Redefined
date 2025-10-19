<template>
    <div class="horizontal-section">
        <div class="big-subsection" :class="bigSubsectionClass">
            <slot name="big"></slot>
        </div>
        <div class="small-subsection" :class="smallSubsectionClass">
            <slot name="small"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            smallLeft: ""
        },

        data(){
            return {
                isDesktop: false
            }
        },

        methods: {
            testDesktop(){
                this.isDesktop = screen.availWidth >= 1025;
            }
        },

        computed: {
            bigSubsectionClass(){
                return this.testDesktop ? (!this.smallLeft ? "big-sub-left" : "big-sub-right") : "";
            },

            smallSubsectionClass(){
                return this.testDesktop ? (!this.smallLeft ? "small-sub-right" : "small-sub-left") : "";
            }
        },

        mounted(){
            this.testDesktop();
            window.addEventListener("resize", this.testDesktop);
        }
    }
</script>

<style>
    .big-subsection .mobile-only{
        display: inline;
    }

    @media only screen and (min-width: 1025px){
        .big-subsection .mobile-only{
            display: none;
        }

        .big-subsection{
            position: absolute;
            width: calc(100% - 425pt);
        }

        .small-sub-right{
            margin-left: calc(100% - 200pt)
        }

        .small-sub-left{
            margin-left: 0;
        }

        .big-sub-left{
            left: 0;
        }

        .big-sub-right{
            left: 405pt;
            width: calc(100% - 475pt);
        }
    }
</style>