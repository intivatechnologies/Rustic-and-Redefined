<script>
    import Slide from './Slide.vue';
    import Slideshow from './Slideshow.vue';

    export default {
        components: {
            Slide,
            Slideshow
        },

        data(){
            return {
                //all slideshow points of reference must be assigned here
                slideshows: {
                    'splash': {
                        slide: 0,
                        offset: {}
                    },
                    'moreProjects': {
                        slide: 0,
                        offset: {}
                    }
                }
            }
        },

        methods: {
            emitToggle(info){
                this.slideshows[info.slideshowName].slide = info.slide;
            },

            emitSlideshowOffset(info){
                this.slideshows[info.slideshowName].offset = info.offset;
            }
        }
    }
</script>