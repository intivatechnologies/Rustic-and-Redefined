<template>
    <div id="navbar-container">
        <navbar :admin-logged="adminLogged" :block="isBlocked" :position="offsetPosition" ref="navbar" />
        <div :class="fakeSpace"></div>
    </div>
</template>

<script>
    import Navbar from './Navbar.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            Navbar
        },

        props: {
            adminLogged: ""
        },

        data(){
            return {
                staticOffset: 0,
                offsetPassed: false
            }
        },

        methods: {
            calculateOffset(){
                if(this.offsetPassed){
                    this.offsetPassed = false;
                    wait.millis(100, this.calculateOffset);
                } else
                    this.staticOffset = this.$refs['navbar'].$el.offsetTop;
            },

            testOffset(){
                if(this.staticOffset != 0){
                    if((!this.offsetPassed && window.scrollY >= this.staticOffset)
                        || (this.offsetPassed && window.scrollY < this.staticOffset))
                        this.offsetPassed = !this.offsetPassed;
                }
            }
        },

        computed: {
            isBlocked(){
                return !this.offsetPassed;
            },

            offsetPosition(){
                return this.offsetPassed ? "fixed" : null;
            },

            fakeSpace(){
                return !this.offsetPassed ? "fake-space-null" : "fake-space-active";
            }
        },

        mounted(){
            wait.millis(100, () => {
                this.calculateOffset();
                this.testOffset();
            });

            window.addEventListener("resize", this.calculateOffset);
            window.addEventListener("scroll", this.testOffset);
        },

        beforeUnmount(){
            window.removeEventListener("resize", this.calculateOffset);
            window.removeEventListener("scroll", this.testOffset);
        }
    }
</script>

<style>
    .fake-space-active{
        height: 52pt;
        display: block;
    }
</style>