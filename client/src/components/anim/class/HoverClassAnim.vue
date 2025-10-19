<script>
    import ClassAnim from './ClassAnim.vue';

    export default {
        extends: ClassAnim,

        data(){
            return {
                hoverExtensions: []
            }
        },

        methods: {
            addHoverExtension(func){
                this.hoverExtensions.push(func);
                this.$refs['anim'].addEventListener('mouseover', func);
                this.$refs['anim'].addEventListener("mouseout", func);
            }
        },

        mounted(){
            this.$refs['anim'].addEventListener('mouseover', this.toggle);
            this.$refs['anim'].addEventListener("mouseout", this.toggle);
        },

        beforeUnmount(){
            this.$refs['anim'].removeEventListener('mouseover', this.toggle);
            this.$refs['anim'].removeEventListener("mouseout", this.toggle);
            for(let func of this.hoverExtensions){
                this.$refs['anim'].removeEventListener('mouseover', func);
                this.$refs['anim'].removeEventListener("mouseout", func);
            }
        }
    }
</script>