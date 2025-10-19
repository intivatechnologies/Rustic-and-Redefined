<template>
    <class-anim target-class="chat-icon" alternate-classes="transition" ref="chat-icon">
        <div id="chat-icon-container">
            <image-loader path="icon/chat.png" alt-value="Chat With Us" />
        </div>
    </class-anim>
</template>

<script>
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import ImageLoader from '../../image/ImageLoader.vue';

    export default {
        components: {
            ClassAnim,
            ImageLoader
        },

        methods: {
            toggleNative(){
                this.$refs['chat-icon'].toggle();
            },

            toggle(){
                this.toggleNative();
                this.$emit('clicked');
            }
        },

        mounted(){
            this.$refs['chat-icon'].$el.addEventListener("click", this.toggle);
        },

        beforeUnmount(){
            this.$refs['chat-icon'].$el.removeEventListener("click", this.toggle);
        }
    }
</script>

<style>
    .chat-icon, .chat-icon-anim{
        position: fixed;
        bottom: 8pt;
        right: 8pt;
        z-index: 10;
        cursor: pointer;
    }

    .chat-icon-anim{
        bottom: 16pt;
        opacity: 0;
        pointer-events: none;
    }

    #chat-icon-container{
        /* height / width = 0.9459459459459459 */
        width: 50pt;
        height: 47.25pt;
        border-radius: 50%;
        border: solid black 1pt;
        padding: 2pt;
        background-color: white;
    }

    #chat-icon-container img{
        width: 100%;
        height: 100%;
    }

    @media only screen and (min-width: 1025px){
        .chat-icon:hover, .chat-icon:active, .chat-icon:visited,
            .chat-icon-anim:hover, .chat-icon-anim:active, .chat-icon-anim:visited{
            bottom: 16pt;
        }

        .chat-icon-anim{
            bottom: 20pt;
        }
    }
</style>