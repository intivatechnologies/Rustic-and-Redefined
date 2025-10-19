<template>
    <div class="page-content fixed-navbar-support">
        <navbar position="fixed" />
        <div id="unsubscription-notice">
            <h2>{{ header }}</h2>
            <h3 v-if="caption && caption.length > 0">{{ pcaption }}</h3>
        </div>
    </div>
</template>

<script>
    import Navbar from '../nav/Navbar.vue';
    import EncryptedPage from './EncryptedPage.vue';

    export default {
        extends: EncryptedPage,

        components: {
            Navbar
        },

        props: {
            header: "",
            caption: ""
        }
    }
</script>

<style>
    #unsubscription-notice{
        text-align: center;
        margin-top: 125pt;
    }
</style>