<template>
    <div :class="classList">
        <slot></slot>
    </div>
</template>

<script>
    import wait from '@/assets/js/wait.js';

    export default {
        props: {
            targetClass: "",
            alternateClasses: ""
        },

        data(){
            return {
                pTargetClass: "",
                pAlternateClasses: "",
                classList: ""
            }
        },

        watch: {
            alternateClasses(){
                this.updateAlternate();
            }
        },

        methods: {
            generateClassList(targetClass = ""){
                if(targetClass != "")
                    this.pTargetClass = targetClass;
                this.classList = this.pTargetClass;
                if(this.pAlternateClasses)
                    this.classList += " " + this.pAlternateClasses;
            },

            updateAlternate(){
                this.pAlternateClasses = this.alternateClasses;
                this.generateClassList();
            }
        },

        mounted(){
            this.pTargetClass = this.targetClass;
            this.updateAlternate();

            if((this.pAlternateClasses + "").includes('transition'))
                wait.millis(100, () => {
                    this.pAlternateClasses = this.pAlternateClasses.replace('transition', 'default-transition');
                    this.generateClassList();
                });
        }
    }
</script>