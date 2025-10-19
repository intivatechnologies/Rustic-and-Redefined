<script>
    export default {
        props: {
            animExtension: "",
            toggleOnRender: ""
        },

        data(){
            return {
                initState: "",
                pAnimExt: "-anim",
                toggled: false
            }
        },

        methods: {
            processAnimState(){
                return this.toggled ? `${this.initState}${this.pAnimExt}` : this.initState;
            },

            isToggled(){
                return this.toggled;
            }
        },

        mounted(){
            if(this.animExt)
                this.pAnimExt = this.animExt;
        }
    }
</script>