<template>
    <div class="page-content">
        <navbar position="fixed" @toggled="() => this.testMenuIsOpen()" :admin-logged="adminLogged">
            <class-anim target-class="toggle-menu" alternate-classes="transition" ref="toggle-menu">
                <div id="toggle-menu-inner">
                    <div v-if="itemCategories.length == 0">
                        <h3>There are no listings yet available on our shop.</h3>
                    </div>
                    <div v-else class="toggle-link default-transition" v-for="itemCategory of itemCategories"
                    @click="() => itemCategory.toggle()">
                        <div class="radio-button">
                            <div class="radio-outline">
                                <div class="radio-ring"></div>
                                <div class="radio-bg"></div>
                            </div>
                            <div class="radio-fill" v-if="itemCategory.toggled"></div>
                        </div>
                        <div class="toggle-link-label">{{ itemCategory.value }}</div>
                    </div>
                    <div id="toggle-menu-exit" class="default-transition"
                    @click="() => this.$refs['toggle-menu'].toggle()">Close Menu</div>
                </div>
            </class-anim>
        </navbar>

        <height-override override-height="true" id="shop-header">
            <parallax path="background/88.jpg" shield-opacity="0.5" running="true" :offset="parallaxOffset">
                <h2>Use the toggle feature to disable categories in our shop!</h2>
                <image-loader-clickable path="icon/toggle.png" alt-value="Toggle by category"
                    id="toggle-btn" @clicked="() => this.$refs['toggle-menu'].toggle()" />
            </parallax>
        </height-override>

        <div id="shop">
            <div class="section" v-if="itemCategories.length > 0" v-for="itemCategory of itemCategories"
            :id="itemCategory.key + ''">
                <div class="section-inner" v-if="itemCategory.toggled">
                    <div class="category-tag"><h3>{{ itemCategory.value }}</h3></div>
                    <item-category-vue :upload-from="itemCategory" :price-mod="priceMod" @update-country="updateCountry" />
                </div>
            </div>
        </div>

        <div id="marketplace-partners" v-if="marketplace.names.length > 0">
            <h4>Our Marketplace Partners</h4>
            <div id="marketplace-partners-group">
                <a v-for="(names, index) of marketplace.names" :href="marketplace.links[index]" target="_blank">{{ names }}</a>
            </div>
        </div>

        <footer-intiva />
    </div>
</template>

<script>
    import '@/assets/css/standard_fixed_navbar.css';
    import '@/assets/css/shop.css';
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import ClassAnimDisplayController from '../../anim/class/ClassAnimDisplayController.vue';
    import ClickClassAnim from '../../anim/class/ClickClassAnim.vue';
    import FooterIntiva from '../FooterIntiva.vue';
    import HeightOverride from '../HeightOverride.vue';
    import ImageLoaderClickable from '../../image/ImageLoaderClickable.vue';
    import InventoryPage from './InventoryPage.vue';
    import ItemCategory from '@/assets/js/ItemCategory.js';
    import ItemCategoryVue from '../inventory/ItemCategory.vue';
    import Parallax from '../../image/Parallax.vue';
    import PORTS from '@/assets/js/PORTS.js';
    import fetch_controller from '@/assets/js/fetch_controller.js';
    import Navbar from '../nav/Navbar.vue';

    export default {
        extends: InventoryPage,

        components: {
            ClassAnim,
            ClassAnimDisplayController,
            ClickClassAnim,
            FooterIntiva,
            HeightOverride,
            ImageLoaderClickable,
            ItemCategoryVue,
            Parallax,
            Navbar
        },

        data(){
            return {
                parallaxOffset: {
                    pos: [0, 0],
                    dims: []
                },
                itemCategories: [],
                priceMod: 1,
                //alternatePriceMod: 1,
                //alternatePriceInquired: false,
                marketplace: {
                    names: [],
                    links: []
                }
            }
        },

        methods: {
            getItemCategoriesList(){
                fetch(`${PORTS.SERVER}/item/categories_and_keys`)
                .then(res => {
                    if(!res.ok){
                        console.error("An error has occurred.");
                        return;
                    }

                    return res.json();
                }).then(data => {
                    //store all categories and if in edit mode store only the selected category
                    for(let i = 1; i < data.itemCategories.length; i++){
                        this.itemCategories.push(new ItemCategory(
                            data.itemCategories[i],
                            data.itemCategoryKeys[i]
                        ));
                    }

                    for(let i = 0; i < this.itemCategories.length; i++)
                        this.itemCategories[i].toggle();
                });
            },

            getMarketplacePartners(){
                fetch(`${PORTS.SERVER}/marketplace/get_partners`)
                .then(res => res.json())
                .then(data => {
                    this.marketplace.names = data.marketplace.names;
                    this.marketplace.links = data.marketplace.links;
                }).catch(err => {
                    if(err){
                        console.error(err);
                        window.alert("An error has occurred getting the marketplace partners.");
                    }
                });
            },

            testMenuIsOpen(){
                if(this.$refs['toggle-menu'].isToggled())
                    this.$refs['toggle-menu'].toggle();
            },

            convertPriceMod(){
                fetch_controller.getJson('/currency_exchange_rate_usd', data => this.priceMod = data.usdRate,
                    err => {
                        window.alert("These prices are displayed in CAD. Before you checkout, the price"
                            + " will be displayed in USD.");
                        console.error(err);
                    });
            },

            updateCountry(data){
                let currency = '';
                if(data.isInternational && this.priceMod === 1){
                    this.convertPriceMod();
                    currency = 'USD';
                } else if(!data.isInternational && this.priceMod !== 1){
                    this.priceMod = 1;
                    currency = 'CAD';
                }

                if(currency != '')
                    window.alert("Prices are now displayed in " + currency);
            }
        },

        mounted(){
            let url = new URL(window.location.href);
            let params = new URLSearchParams(url.search);
            if(params.get('admin_edit_mode'))
                localStorage.setItem('admin-edit-mode', true);

            window.addEventListener("scroll", this.testMenuIsOpen);
            this.parallaxOffset.dims = [screen.availWidth, screen.availHeight];
            this.getItemCategoriesList();
            this.getMarketplacePartners();
            if(window.location.href.includes('/us'))
                this.convertPriceMod();
        },

        beforeUnmount(){
            window.removeEventListener("scroll", this.testMenuIsOpen);
            localStorage.removeItem('admin-edit-mode');
        }
    }
</script>