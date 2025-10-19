<template>
    <div class="page-content">
        <div id="login">
            <h2>Please type your shop password.</h2>
            <input :type="loadPasswordVisibility" ref="password"
                @keypress="ev => { if(ev.keyCode == 13) verify(); }" /><br />
            <input type="checkbox" @click="togglePasswordVisibility" />
            <label for="password-checkbox">View password</label><br />
            <input type="submit" value="Log In" @click="verify" />
        </div>
    </div>
</template>

<script>
    import PORTS from '@/assets/js/PORTS.js';
    import mainRouter from '@/router/index.js';

    export default {
        data(){
            return {
                passwordVisible: false
            }
        },

        computed: {
            loadPasswordVisibility(){
                return this.passwordVisible ? "text" : "password";
            }
        },

        methods: {
            togglePasswordVisibility(){
                this.passwordVisible = !this.passwordVisible;
            },

            verify(){
                if(this.$refs['password'].value.length > 0){
                    fetch(`${PORTS.SERVER}/dashboard/authentication/${this.$refs['password'].value}`)
                        .then(res => res.json())
                        .then(data => {
                            if(!data.authentic){
                                window.alert("Your password is incorrect.");
                                this.$refs['password'].value = "";
                            } else {
                                localStorage.setItem('loginId', this.$refs['password'].value);
                                mainRouter.replace({ path: '/dashboard' });
                            }
                        }).catch(err => {
                            if(err){
                                console.error(err);
                                window.alert("An error occurred submitting the forms.");
                            }
                        });
                } else
                    window.alert("Please fill out the password field.");
            }
        }
    }
</script>

<style>
    #login{
        text-align: center;
    }
</style>