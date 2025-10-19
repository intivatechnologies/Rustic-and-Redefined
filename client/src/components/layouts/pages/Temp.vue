<template>
    <static-message header="Our website is coming soon!" />
    <div id="admin">
        To log into the admin portal, click <router-link to="/login">here.</router-link>
    </div>
</template>

<script>
    import StaticMessage from './StaticMessage.vue';

    export default {
        components: {
            StaticMessage
        }
    }
</script>

<style>
    #admin{
        text-align: center;
    }
</style>