<template>
    <div :class="classList" ref="controller">
        <slot></slot>
    </div>
</template>

<script>
    import AlternateClassProvider from '../../AlternateClassProvider.vue';

    export default {
        extends: AlternateClassProvider,

        components: {
            AlternateClassProvider
        },

        data(){
            return {
                initState: "",
                extension: 0,
                taskProtocols: []
            }
        },

        methods: {
            generateExtension(){
                this.generateClassList(`${this.initState} ext-${this.extension}`);
            },

            toggleUp(){
                ++this.extension;
                this.detectTaskProtocol();
                this.generateExtension();
                this.$emit('toggled');
            },

            toggleDown(){
                --this.extension;
                this.detectTaskProtocol();
                this.generateExtension();
                this.$emit('toggled');
            },

            //launches assigned function at specified extension
            setTaskProtocol(index, func){
                if(this.taskProtocols.length < index){
                    for(let i = this.taskProtocols.length; i <= index; i++)
                        this.taskProtocols.push(i != index ? null : func);
                } else
                    this.taskProtocols[index] = func;
            },

            detectTaskProtocol(){
                if(this.taskProtocols.length > this.extension && this.taskProtocols[this.extension] != null)
                    this.taskProtocols[this.extension]();
            },

            getToggleLevel(){
                return this.extension;
            }
        },

        mounted(){
            this.initState = this.targetClass;
            this.generateExtension();
        }
    }
</script>