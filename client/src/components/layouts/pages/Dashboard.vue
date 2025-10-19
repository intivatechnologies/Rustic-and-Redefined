<template>
    <div class="page-content fixed-navbar-support">
        <navbar position="fixed" :admin-logged="adminLogged" /><br />

        <div id="dashboard" v-if="loginState == 0 || loginState === 1">
            <class-anim target-class="wait-msg" alternate-classes="transition" ref="wait-msg">
                <h1>Please Wait&#8230;</h1>
            </class-anim>

            <div id="taskbar">
                <button @click="redirectHome"><h1>Log Out</h1></button>
            </div>

            <!--Shop & Projects-->
            <div class="expand-me">
                <div class="banner" @click="() => this.$refs['shop-inner'].toggle()">
                    <h1>Shop &#38; Projects {{ productEditMode ? ' (Add Item)' : '' }}</h1>
                    <span class="banner-btn">Expand/Close</span>
                </div>
                <class-anim target-class="expand-me-inner" alternate-classes="shop-inner" ref="shop-inner">
                    <div class="product-info">
                        <label for="product-category">Type</label>
                        <select ref="item-category-select" @change="selectItemCategory">
                            <option v-for="(itemCategory, index) of itemCategories"
                            :selected="itemCategoryIndexSelected == index"
                            :value="itemCategoryKeys[index]" :key="index">{{ itemCategory }}</option>
                        </select><br />
                        <div class="product-readable">
                            <label for="product-name">Name</label>
                            <input type="text" ref="product-name" /><br />
                            <div id="product-readable-price" v-if="itemCategoryIndexSelected != 0">
                                <label for="product-price">Price $</label>
                                <input type="number" ref="product-price" id="product-price" /><br />
                            </div>
                            <label for="product-about">About</label>
                            <textarea ref="product-about"></textarea><br />
                            <div id="product-metrics" v-if="itemCategoryIndexSelected != 0">
                                <label for="product-weight">Weight (lbs):</label>
                                <input type="text" ref="product-weight" id="product-weight" class="product-measurement" />
                                <label for="product-disclaimer">
                                    <small style="font-size: 10pt">Length+2*(Width+Height) must be less or equal than 165</small>
                                </label><br />
                                <label for="product-width">Inches: Width</label>
                                <input type="text" ref="product-width" id="product-width" class="product-measurement" />
                                <label for="product-height">Height</label>
                                <input type="text" ref="product-height" id="product-height" class="product-measurement" />
                                <label for="product-length">Length</label>
                                <input type="text" ref="product-length" id="product-length" class="product-measurement" />
                            </div>
                        </div>
                    </div>
                    <div class="product-display">
                        <hover-class-anim target-class="large-display-container" ref="display-0">
                            <parallax class="large-display display" ref="display-inner-0" :shield-opacity="dsOpacity1">
                                <class-anim target-class="thumbnail-context" alternate-classes="transition"
                                ref="thumbnail-context-0">
                                    <div>Drag image here to upload</div><br />
                                    <div>Thumbnail ({{ this.editModeBefore ? 'Before' : 'After' }})</div>
                                </class-anim>
                            </parallax>
                        </hover-class-anim>
                        <hover-class-anim target-class="small-display-container" ref="display-1">
                            <parallax class="small-display display" ref="display-inner-1" :shield-opacity="dsOpacity2">
                                <class-anim target-class="thumbnail-context" alternate-classes="transition"
                                ref="thumbnail-context-1">
                                    <div>1</div>
                                </class-anim>
                            </parallax>
                        </hover-class-anim>
                        <hover-class-anim target-class="small-display-container" ref="display-2">
                            <parallax class="small-display display" ref="display-inner-2" :shield-opacity="dsOpacity3">
                                <class-anim target-class="thumbnail-context" alternate-classes="transition"
                                ref="thumbnail-context-2">
                                    <div>2</div>
                                </class-anim>
                            </parallax>
                        </hover-class-anim>
                        <hover-class-anim target-class="small-display-container" ref="display-3">
                            <parallax class="small-display display" ref="display-inner-3" :shield-opacity="dsOpacity4">
                                <class-anim target-class="thumbnail-context" alternate-classes="transition"
                                ref="thumbnail-context-3">
                                    <div>3</div>
                                </class-anim>
                            </parallax>
                        </hover-class-anim>
                        <h3>Capacity({{ editModeBefore ? "before" : "after" }} images): {{
                            editModeBefore ? displayImages.beforeURL.length : displayImages.afterURL.length}}, Max: 4</h3>
                    </div>
                    <div class="product-options">
                        <input type="radio" value="before" name="display-mode"
                        @click="() => this.setEditModeBefore(true)" />
                        <label for="before">Before</label><br />
                        <input type="radio" value="after" name="display-mode" checked="checked"
                        @click="() => this.setEditModeBefore(false)" />
                        <label for="after">After</label><br />
                        <input type="submit" value="Clear" id="product-options-clear" @click="clearProduct" /><br />
                        <input type="submit" :value="productEditMode ? 'Update' : 'Submit'"
                            id="product-options-submit" @click="submitProduct" />
                    </div>
                    <div id="briefcase">
                        <div id="briefcase-label">Manage Product Categories (Add/Delete/View)</div>
                        <div id="item-categories">
                            <div class="item-category-container" v-for="(itemCategory, index) of itemCategories">
                                <div class="item-category" @click="() => visitItemCategory(index)">
                                    <h2>{{ itemCategory }}</h2>
                                </div>
                                <button class="item-category-exit" v-if="index > 0"
                                    @click="() => deleteItemCategory(index)">X</button>
                            </div>
                        </div>
                        <input type="text" id="item-category-new" ref="item-category-new"
                            @keypress="ev => { if(ev.keyCode == 13) addItemCategory(); }" />
                        <input type="submit" value="Add" id="item-category-submit" @click="addItemCategory" />
                    </div>
                </class-anim>
            </div>

            <!--Newsletter-->
            <div class="expand-me">
                <div class="banner" @click="() => this.$refs['newsletter-inner'].toggle()">
                    <h1>Newsletter</h1>
                    <span class="banner-btn">Expand/Close</span>
                </div>
                <class-anim target-class="expand-me-inner" alternate-classes="newsletter-inner" ref="newsletter-inner">
                    <div id="newsletter-subscribers-container">
                        <h3>Subscriber List</h3>
                        <textarea ref="newsletter-subscribers" readonly></textarea>
                    </div>
                    <div id="newsletter-station">
                        <h3>Send Out A Newsletter</h3>
                        <b id="newsletter-subject-label">Subject</b>
                        <textarea id="newsletter-subject" ref="newsletter-subject"></textarea>
                        <button id="attach-to-newsletter" @click="attachToNewsletter">
                            <image-loader path="icon/capture.png" alt-value="Attach" />
                        </button>
                        <div id="newsletter-body" ref="newsletter-body" @click="() => this.$refs['text-division-0'].focus()"
                        contenteditable="true">
                            <div class="text-division" id="text-division-0" ref="text-division-0"
                                contenteditable="contenteditable"></div>
                        </div>
                        <button id="newsletter-send" @click="sendNewsletter">Send</button>
                    </div>
                </class-anim>
            </div>

            <!--Marketplace partners-->
            <div class="expand-me">
                <div class="banner" @click="() => this.$refs['marketplace-inner'].toggle()">
                    <h1>Marketplace Partners</h1>
                    <span class="banner-btn">Expand/Close</span>
                </div>
                <class-anim target-class="expand-me-inner" alternate-classes="marketplace-inner" ref="marketplace-inner">
                    <div id="marketplace-add-partner">
                        <label for="name">Name</label>
                        <input type="text" ref="marketplace-name" />
                        <label for="link">Link</label>
                        <input type="text" ref="marketplace-link" @keypress="requestAddToMarketplace" />
                        <button @click="addToMarketplace">Submit</button><br />
                    </div>
                    <div>
                        <h4 v-if="marketplace.names.length > 0">Partners</h4><br />
                        <ul>
                            <li v-for="(partner, index) of marketplace.names">
                                {{ partner }} (<a :href="marketplace.links[index]"
                                target="_blank">{{ marketplace.links[index] }}</a>)
                                <button @click="() => deleteFromMarketplace(index)">X</button>
                            </li>
                        </ul>
                    </div>
                </class-anim>
            </div>
        </div>
    </div>
</template>

<script>
    import DashboardParent from './DashboardParent.vue';

    export default {
        extends: DashboardParent
    }
</script>