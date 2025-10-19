<script>
    import ClassController from './ClassController.vue';
    import media_query from '@/assets/js/media_query.js';
    import wait from '@/assets/js/wait.js';

    export default {
        extends: ClassController,

        props: {
            portraitTriggers: "",
            landscapeTriggers: ""
        },

        data(){
            return {
                pPortraitTriggers: [],
                pLandscapeTriggers: [],
                mQuerySwitch: 0,
                isLandscape: false,
                toggleDownInitiated: false
            }
        },

        methods: {
            processTriggers(sender, receiver){
                let s = sender.split('[')[1].split(', ');
                for(let i = 0; i < s.length - 1; i++)
                    receiver.push(Number(s[i]));
                receiver.push(Number(s[s.length - 1].split(']')[0]));
            },

            trackMediaQuery(){
                this.mQuerySwitch = media_query.getQuerySwitch();
                this.isLandscape = screen.availWidth > screen.availHeight;
            },

            trackScroll(){
                let triggers = this.isLandscape ? this.pLandscapeTriggers : this.pPortraitTriggers;
                if(this.extension == 0 && window.scrollY
                    >= this.$refs['controller'].offsetTop - triggers[this.mQuerySwitch]){
                    this.toggleDownInitiated = false;
                    this.toggleUp();
                } else if(!this.toggleDownInitiated && this.extension != 0 && window.scrollY
                    < this.$refs['controller'].offsetTop - triggers[this.mQuerySwitch]){
                    this.toggleDownInitiated = true;
                    this.toggleDown();
                }
            },

            getOffsetTop(){
                return this.$refs['controller'].offsetTop;
            },

            getExtension(){
                return this.extension;
            },

            isToggleDownInitiated(){
                return this.toggleDownInitiated;
            }
        },

        mounted(){
            this.processTriggers(this.portraitTriggers, this.pPortraitTriggers);
            this.processTriggers(this.landscapeTriggers, this.pLandscapeTriggers);

            //wait so DOM loads first for independent elements
            wait.millis(400, () => {
                this.trackMediaQuery();
                window.addEventListener("resize", this.trackMediaQuery);
                wait.millis(100, this.trackScroll);
                window.addEventListener("scroll", this.trackScroll);
            });
        },

        beforeUnmount(){
            window.removeEventListener("resize", this.trackWidthSwitch);
            window.removeEventListener("scroll", this.trackScroll);
        }
    }
</script>