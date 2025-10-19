<script>
    import ImageLoader from './ImageLoader.vue';

    export default {
        extends: ImageLoader,

        props: {
            mobileExtension: ""
        },

        data(){
            return {
                pMobileExtension: "_mobile",
                processedPathMobile: undefined
            }
        },

        methods: {
            processMobileMode(){
                if(screen.availWidth < 1025){
                    let path = this.path.substring(0, this.path.length - 4),
                        fileType = this.path.substring(this.path.length - 4, this.path.length);
                    this.processedPath = this.generatePath(path + this.pMobileExtension + fileType);
                    return true;
                } else
                    return false;
            },

            processPath(){
                if(!this.processMobileMode())
                    this.processedPath = this.generatePath(this.path);
            }
        },

        mounted(){
            if(this.mobileExtension)
                this.pMobileExtension = this.mobileExtension;
            
            this.processMobileMode();
            window.addEventListener("resize", this.processPath);
        }
    }
</script>