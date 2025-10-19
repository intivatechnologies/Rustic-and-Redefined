<script>
    export default {
        props: {
            path: "",
            overridePath: ""
        },

        data(){
            return {
                processedPath: undefined
            }
        },

        watch: {
            path(){
                this.processedPath = this.generatePath(this.path);
            },

            overridePath(){
                this.overrideProcessedPath();
            }
        },

        methods: {
            generatePath(path){
                return require(`@/assets/images/${path}`);
            },

            shovePath(path){
                this.processedPath = path;
            },

            overrideProcessedPath(){//should be this instead next time
                if(this.overridePath)
                    this.processedPath = this.overridePath;
            },

            getProcessedPath(){
                return this.processedPath;
            }
        },

        mounted(){
            if(this.path)
                this.processedPath = this.generatePath(this.path);
            this.overrideProcessedPath();
        }
    }
</script>