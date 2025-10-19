<template>
    <div class="nav-links" ref="nav-links">
        <span class="nav-link"><router-link to="/">Home</router-link></span>
        <template v-if="adminLogged">
            <span class="nav-link"><router-link to="/shop">Shop</router-link></span>
            <span class="nav-link"><router-link to="/projects">Projects &#38; Services</router-link></span>
        </template>
        <span class="nav-link"><router-link to="/contact">Contact</router-link></span>
    </div>
</template>

<script>
    import { RouterLink } from 'vue-router';

    export default {
        components: {
            RouterLink
        },

        props: {
            adminLogged: ""
        }
    }
</script>

<style>
    .nav-link a{
        transition: 0.2s;
        font-family: 'Special Elite', sans-serif;
        text-decoration: none;
        color: white;
    }

    .nav-link a:hover, .nav-link a:active{
        color: rgb(200, 200, 200);
    }
</style>