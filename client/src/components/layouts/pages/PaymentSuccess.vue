<template>
    <static-message header="Order complete! We've sent an invoice to your email." />
</template>

<script>
    import fetch_controller from '@/assets/js/fetch_controller.js';
    import StaticMessage from './StaticMessage.vue';

    export default {
        components: {
            StaticMessage
        },

        mounted(){
            let url = new URL(window.location.href);
            let params = new URLSearchParams(url.search);
            console.log(new URLSearchParams(url.search).get("transaction_key"));
            console.log(params.get("fireoff"))
            fetch_controller.getJson(`/email_invoice/${params.get("transaction_key")}/${params.get("fireoff")}`,
                data => {
                    console.log(data);
                });
        }
    }
</script>