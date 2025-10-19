<template>
    <div :class="classList" ref="anim">
        <slot></slot>
    </div>
</template>

<script>
    import AlternateClassProvider from '../../AlternateClassProvider.vue';
    import Anim from '../Anim.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        extends: Anim,

        mixins: [AlternateClassProvider],

        methods: {
            togglePrivate(){
                this.toggled = !this.toggled;
                this.generateClassList(this.processAnimState());
            },

            toggle(){
                this.togglePrivate();
                this.$emit('toggled');
            }
        },

        mounted(){
            if(!this.targetClass){
                console.error("A target class must be defined on render for ClassAnim.");
                return;
            }

            this.initState = this.targetClass;
            if(this.toggleOnRender === 'true')
                wait.millis(50, this.toggle);
        }
    }
</script>