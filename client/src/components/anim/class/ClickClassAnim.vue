<script>
    import ClassAnim from './ClassAnim.vue';

    export default {
        extends: ClassAnim,

        methods: {
            emitClick(){
                this.toggle();
                this.$emit('clicked');
            }
        },

        mounted(){
            this.$refs['anim'].addEventListener('click', this.emitClick);
        },

        beforeDestroy(){
            this.$refs['anim'].removeEventListener('click', this.emitClick);
        }
    }
</script>