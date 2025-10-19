<script>
    import ImageLoader from './ImageLoader.vue';

    export default {
        extends: ImageLoader,

        methods: {
            emitClick(){
                this.$emit('clicked');
            }
        },

        mounted(){
            this.$refs['image'].addEventListener('click', this.emitClick);
        },

        beforeUnmount(){
            this.$refs['image'].removeEventListener('click', this.emitClick);
        }
    }
</script>