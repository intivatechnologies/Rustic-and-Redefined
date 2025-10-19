<template>
    <alternate-class-provider target-class="height-override" :alternate-classes="alternateClasses"
        ref="height-override" :style="heightAttr">
        <slot></slot>
    </alternate-class-provider>
</template>

<script>
    import AlternateClassProvider from '../AlternateClassProvider.vue';

    export default {
        components: {
            AlternateClassProvider
        },

        props: {
            overrideHeight: "",
            alternateClasses: ""
        },

        data(){
            return {
                heightAttr: "auto"
            }
        },

        methods: {
            generateHeightAttr(){
                if(this.overrideHeight)
                    this.heightAttr = `height: ${window.innerWidth < 1025 ? screen.availHeight : window.innerHeight - 1}px`;
            }
        },

        mounted(){
            this.generateHeightAttr();
            window.addEventListener("resize", this.generateHeightAttr);
        }
    }
</script>

<style>
    .height-override{
        display: block;
    }
</style>