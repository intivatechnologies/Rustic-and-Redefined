<script>
    import EncryptedPage from './EncryptedPage.vue';

    export default {
        extends: EncryptedPage,

        data(){
            return {
                isEditMode: false,
                editItemCategoryKey: -1,
                adminLogged: true
            }
        },

        mounted(){
            this.isEditMode = localStorage.getItem('admin-edit-mode');
            this.editItemCategoryKey = localStorage.getItem('edit-item-category-key');
            if(this.isEditMode)
                this.editItemCategoryKey = Number(this.editItemCategoryKey);
        }
    }
</script>