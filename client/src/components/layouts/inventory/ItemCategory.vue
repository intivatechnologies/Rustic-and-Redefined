<template>
    <div class="category-container">
        <div :class="`category ${uploadFrom.items.length == 0 ? '' : 'category-fill'}`">
            <div class="category-content">
                <div class="item-thumbnail" v-for="(item, index) in uploadFrom.items" :key="index">
                    <div class="item-thumbnail-options">
                        <button class="delete-item" @click="() => deleteItem(index)" v-if="editMode">
                            <div class="delete-x">x</div>
                        </button>
                        <button class="add-category" @click="() => addItem(index)" v-if="editMode">
                            <div class="category-plus">+</div>
                        </button>
                    </div>
                    <img :src="item.afterImages[0] ? item.afterImages[0] : ''" class="item-thumbnail-image"
                        @click="() => thumbnailClicked(index)" :ref="`thumbnail-${index}`" />
                </div>
                <button class="add-category last-add-category" @click="() => addItem(uploadFrom.items.length)"
                v-if="editMode && uploadFrom.items.length > 0">
                    <div class="category-plus">+</div>
                </button>
                <h2 v-else-if="uploadFrom.items.length == 0">There are currently no items on shelf in this category.</h2>
            </div>
        </div>
        <class-anim target-class="item-showcase" alternate-classes="transition" ref="item-showcase">
            <item v-if="itemDisplayed != -1 && uploadFrom.items[itemDisplayed]" :price-mod="priceMod"
                :data="uploadFrom.items[itemDisplayed]" :parent-key="uploadFrom.key" :parent-index="itemDisplayed"
                @image-showcased="showcaseImage" @update-country="data => this.$emit('update-country', data)" />
        </class-anim>
    </div>
</template>

<script>
    import Algorithm from '@/assets/js/Algorithm.js';
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import Item from './Item.vue';
    import PORTS from '@/assets/js/PORTS.js';

    export default {
        components: {
            ClassAnim,
            Item
        },

        props: {
            uploadFrom: "",
            isEmpty: "",
            priceMod: ""
        },

        data(){
            return {
                itemDisplayed: -1,
                editMode: false,
                pIsEmpty: true,
                lastAddCategoryLeft: -1,
                lastAddCategoryTop: -1,
                displayCategoryKey: -1
            }
        },

        watch: {
            isEmpty(){
                this.pIsEmpty = this.isEmpty;
            }
        },

        methods: {
            async loginPermitting(){
                const res = await fetch(`${PORTS.SERVER}/dashboard/authentication/${localStorage.getItem('loginId')}`);
                const json = await res.json();

                if(json.authentic)
                    return true;
                else {
                    window.alert("You may not have access to this feature. Please log into the dashboard.");
                    return false;
                }
            },

            async addItem(index){
                let loginPermitting = this.loginPermitting();
                if(loginPermitting){
                    localStorage.setItem('storage-should-store', 'true');
                    localStorage.setItem('product-edit-mode', 'true');
                    localStorage.setItem('edit-item-place-at', index != this.uploadFrom.items.length ? index : -1 + '');
                    if(this.uploadFrom != null)
                        localStorage.setItem('edit-item-category-key', this.uploadFrom.key);
                    window.location.href = `${PORTS.CLIENT}/dashboard`;
                }
            },

            async thumbnailClicked(index){
                let loginPermitting = this.loginPermitting();
                if(loginPermitting && localStorage.getItem('admin-edit-mode')){
                    localStorage.setItem('edit-item-category-key', this.uploadFrom.key);
                    localStorage.setItem('edit-item-category-index', index);
                    window.location.href = `${PORTS.CLIENT}/dashboard`;
                } else {
                    this.itemDisplayed = index;
                    if(!this.$refs['item-showcase'].isToggled())
                        this.$refs['item-showcase'].toggle();

                    this.uploadFrom.items[index].queueElementsByItem(this.uploadFrom.key, index);
                }
            },

            showcaseImage(info){
                this.$emit('item-showcased', info);
            },

            async deleteItem(index){
                let loginPermitting = this.loginPermitting();
                if(loginPermitting && window.confirm("Are you sure you want to delete this item?"
                    + " All of its data will be deleted permanently.")){
                    let deleted = this.uploadFrom.items[index];
                    this.uploadFrom.items = new Algorithm.DeleteAlgorithm(this.uploadFrom.items).getProduct(index);
                    fetch(`${PORTS.SERVER}/item/delete`, PORTS.postOptions({
                        itemCategoryKey: this.uploadFrom.key,
                        indexAt: index
                    })).catch(err => { if(err) console.error(err); });
                }
            }
        },

        mounted(){
            this.editMode = localStorage.getItem('admin-edit-mode');
        },

        /*
        beforeUnmount(){
            if(!localStorage.getItem('storage-should-store')){
                let prevAuthentication = undefined;
                if(localStorage.getItem('authentication'))
                    prevAuthentication = localStorage.getItem('authentication');
                localStorage.clear();
                if(prevAuthentication)
                    localStorage.setItem('authentication', prevAuthentication);
            } else
                localStorage.removeItem('storage-should-store');
        }
        */
    }
</script>

<style>
    /* Reverse CSS - Desktop to mobile (Reset values unknown) */
    .category{
        background-color: white;
    }

    .category-fill{
        height: auto;
    }

    .category-content{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        padding-top: 20pt;
        padding-bottom: 6pt;
    }

    .category-content h2{
        margin-top: -16pt;
    }

    .item-thumbnail{
        display: inline-block;
        margin-left: 15pt;
        margin-right: 15pt;
        margin-bottom: 10pt;
        transform: none;
    }

    .category .item-thumbnail:first-child{
        margin-left: 0;
    }

    .category .item-thumbnail:last-child{
        margin-right: 0;
    }

    .item-thumbnail-options{
        position: absolute;
    }

    .add-category{
        transition: 0.2s;
        background-image: linear-gradient(45deg, rgb(25, 25, 25), rgb(100, 100, 100));
        color: white;
        font-size: 22pt;
        width: 25pt;
        height: 25pt;
        border-radius: 4pt;
        border: none;
        cursor: pointer;
    }

    .last-add-category{
        margin-top: -18pt;
        margin-left: -12pt;
    }

    .last-add-category:hover, .last-add-category:active, .last-add-category:visited{
        margin-top: -24pt;
    }

    .item-thumbnail-options .add-category{
        margin-top: 55pt;
        margin-left: -27.5pt;
    }

    .item-thumbnail-options .add-category:hover, .item-thumbnail-options .add-category:active,
        .item-thumbnail-options .add-category:visited{
        margin-top: 51pt;
    }

    .category-plus{
        transition: 0.2s;
        margin-top: -6pt;
    }

    .delete-item{
        background-image: linear-gradient(45deg, rgb(25, 25, 25), rgb(100, 100, 100));
        border: none;
        border-radius: 50%;
        margin-left: -12pt;
        margin-top: -12pt;
        cursor: pointer;
        position: absolute;
    }

    .delete-x{
        color: white;
        font-weight: 600;
        font-size: 18pt;
        padding: 0pt 5pt 3pt 5pt;
    }

    .item-thumbnail-image{
        transition: 0.4s;
        width: auto;
        height: 140pt;
        box-shadow: 3px 6px 12px #888888;
        cursor: pointer;
    }

    .item-thumbnail-image:hover, .item-thumbnail-image:active, .item-thumbnail-image:visited{
        box-shadow: 5px 10px 20px #5e5e5e;
    }

    .item-showcase, .item-showcase-anim{
        background-color: #fdeed5;
        display: block;
        height: 0;
    }

    .item-showcase-anim{
        height: auto;
    }

    @media only screen and (max-width: 1024px){
        .category{
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
        }

        .category .item-thumbnail:last-child{
            padding-right: 25pt;
        }

        .category-fill{
            height: 185pt;
        }

        .category-content{
            position: relative;
            top: 50%;
            transform: translateY(-50%);
            display: block;
            flex-wrap: none;
            align-items: left;
            justify-content: left;
            margin-left: 25pt;
            padding-top: 0;
            padding-bottom: 0;
        }

        .category-content h2{
            margin-top: 36pt;
        }

        .last-add-category{
            position: absolute;
            margin-top: 58pt;
        }

        .item-thumbnail{
            margin-top: 6pt;
            margin-bottom: 0;
        }
    }
</style>