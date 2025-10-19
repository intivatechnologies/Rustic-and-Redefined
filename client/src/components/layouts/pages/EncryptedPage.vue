<script>
    import Page from './Page.vue';
    import PORTS from '@/assets/js/PORTS.js';

    export default {
        extends: Page,

        data(){
            return {
                transitionMade: false,
            }
        },

        methods: {
            failCallback(){
                if(!window.location.href.includes('/login') && !window.location.href.includes('/temp'))
                    window.location.href = `${PORTS.CLIENT}/temp`;
            }
        },

        mounted(){
            if(!window.location.href.includes('/login') && !window.location.href.includes('/temp')){
                let loginId = localStorage.getItem('loginId');
                if(!loginId)
                    this.failCallback();
                else
                    fetch(`${PORTS.SERVER}/dashboard/authentication/${loginId}`)
                        .then(res => res.json())
                        .then(data => {
                            this.transitionMade = data.authentic;
                            if(!data.authentic)
                                this.failCallback();
                        })
                        .catch(err => {
                            if(err)
                                this.failCallback();
                        });
            }
        }
    }
</script>