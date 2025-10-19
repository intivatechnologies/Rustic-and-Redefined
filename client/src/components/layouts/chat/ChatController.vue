<template>
    <div id="chat-controller">
        <chat-icon @clicked="queueMessenger" ref="chat-icon" />
        <chat-messenger @exited="queueIcon" ref="chat-messenger" />
    </div>
</template>

<script>
    import ChatIcon from './ChatIcon.vue';
    import ChatMessenger from './ChatMessenger.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ChatIcon,
            ChatMessenger
        },

        methods: {
            queueMessenger(){
                wait.millis(400, this.$refs['chat-messenger'].toggleNative);
            },

            queueIcon(){
                wait.millis(400, this.$refs['chat-icon'].toggleNative);
            }
        }
    }
</script>

<style>
    #chat-controller{
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 10;
    }
</style>