<template>
    <div :style="displayAttr" class="display-controller">
        <class-anim ref="class-anim" :target-class="targetClass" :alternate-classes="alternateClasses"
        :toggle-on-render="toggleOnRender">
            <slot></slot>
        </class-anim>
    </div>
</template>

<script>
    import ClassAnim from './ClassAnim.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClassAnim
        },

        props: {
            targetClass: "",
            alternateClasses: "",
            toggleOnRender: "",
            transitionSpeed: ""
        },

        data(){
            return {
                isToggled: false
            }
        },

        computed: {
            displayAttr(){
                return 'display: ' + (this.isToggled ? 'block' : 'none');
            }
        },

        methods: {
            toggle(){
                if(!this.isToggled){
                    this.isToggled = true;
                    wait.millis(25, this.$refs['class-anim'].toggle);
                } else {
                    this.$refs['class-anim'].toggle();
                    wait.millis(!this.transitionSpeed ? 400 : Number(this.transitionSpeed), () => { this.isToggled = false; });
                }
            }
        },

        mounted(){
            if(this.toggleOnRender)
                this.toggle();
        }
    }
</script>