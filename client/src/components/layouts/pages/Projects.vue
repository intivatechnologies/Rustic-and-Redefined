<template>
    <div class="page-content">
        <chat-controller />

        <navbar position="fixed" :admin-logged="adminLogged" />

        <div id="projects-display" v-if="projectDisplay.toggled" @click="projectDisplayExit">
            <img id="projects-display-image" :src="projectDisplay.URL" alt="View Image" @click="projectDisplayClicked"
                ref="projects-display-image" />
            <div id="projects-display-info" :style="projectsDisplayInfoAttr">
                <div id="projects-display-info-inner" :style="projectsDisplayInfoInnerAttr">
                    <h1>{{ projectDisplay.name }}</h1>
                    <h3>{{ projectDisplay.about }}</h3>
                </div>
            </div>
        </div>

        <height-override override-height="true">
            <parallax path="scrape2/88N_2.jpg" shield-opacity="0.5" bg-x="75" running="true" :offset="parallaxOffset">
                <h2>Get To Know Us</h2>
                <p>
                    We are a family-run business with 40 years of experience in sourcing rustic
                    items and redefining what you value.
                </p>
            </parallax>
            <div id="projects-anchor" ref="projects-anchor">
                <h3>View Our Projects</h3>
                &#8595;
            </div>
        </height-override>

        <div id="services">
            <div class="service">
                <image-loader path="compare/compare_cola.jpg" class="service-display" />
                <h2>Redefining</h2>
                <p>
                    We specialize in taking antiques to their full modern potential.
                </p>
            </div>
            <div class="service">
                <image-loader path="compare/compare_ford.jpg" class="service-display" />
                <h2>Restoration</h2>
                <p>
                    We restore the value on antiques by making them look unscathed.
                </p>
            </div>
            <div class="service" id="last-service">
                <image-loader path="compare/compare_jewel.jpg" class="service-display" />
                <h2>Sales &#38; Sourcing</h2>
                <p>
                    We sell not only our own product but are also open to helping
                    the restoration community as a whole! Tap the chat icon to
                    get in touch.
                </p>
            </div>
        </div>

        <div id="projects" ref="projects">
            <item-category-vue v-if="projects" :upload-from="projects" @item-showcased="projectDisplayActivate" />
        </div>

        <footer-intiva />
    </div>
</template>

<script>
    import ChatController from '../chat/ChatController.vue';
    import ClickClassAnim from '../../anim/class/ClickClassAnim.vue';
    import FooterIntiva from '../FooterIntiva.vue';
    import HeightOverride from '../HeightOverride.vue';
    import ImageLoader from '../../image/ImageLoader.vue';
    import InventoryPage from './InventoryPage.vue';
    import ItemCategory from '@/assets/js/ItemCategory.js';
    import ItemCategoryVue from '../inventory/ItemCategory.vue';
    import Navbar from '../nav/Navbar.vue';
    import Parallax from '../../image/Parallax.vue';
    import wait from '@/assets/js/wait.js';

    export default {
        extends: InventoryPage,

        components: {
            ChatController,
            ClickClassAnim,
            FooterIntiva,
            HeightOverride,
            ImageLoader,
            InventoryPage,
            ItemCategoryVue,
            Navbar,
            Parallax
        },

        data(){
            return {
                parallaxOffset: {
                    pos: [0, 0],
                    dims: []
                },
                projects: undefined,
                projectDisplay: {
                    toggled: false,
                    divClicked: false,
                    URL: "",
                    name: "",
                    about: "",
                    dimX: 0,
                    dimY: 0
                }
            }
        },

        computed: {
            projectsDisplayInfoAttr(){
                return `width: ${this.projectDisplay.dimX}px; height: ${this.projectDisplay.dimY}px`;
            },

            projectsDisplayInfoInnerAttr(){
                return `top: ${this.projectDisplay.dimY / 2}px`;
            }
        },

        methods: {
            scrollToProjects(){
                window.scrollTo({
                    top: this.$refs['projects'].offsetTop,
                    behavior: 'smooth'
                });
            },

            getProjects(){
                this.projects = new ItemCategory("Projects", 0);
                this.projects.toggle();
            },

            projectDisplayActivate(info){
                this.projectDisplay.URL = info.imageURL;
                this.projectDisplay.name = info.name;
                this.projectDisplay.about = info.about;
                this.projectDisplay.toggled = true;

                wait.millis(50, () => {
                    this.projectDisplay.dimX = this.$refs['projects-display-image'].offsetWidth;
                    this.projectDisplay.dimY = this.$refs['projects-display-image'].offsetHeight;
                });
            },

            projectDisplayClicked(){
                this.projectDisplay.divClicked = true;
            },

            projectDisplayExit(){
                wait.millis(50, () => {
                    if(!this.projectDisplay.divClicked)
                        this.projectDisplay.toggled = false;
                    else
                        this.projectDisplay.divClicked = false;
                });
            },

            toggleProjectDisplayInfo(){
                this.projectDisplay.infoToggled = !this.projectDisplay.infoToggled;
            }
        },

        mounted(){
            let url = new URL(window.location.href);
            let params = new URLSearchParams(url.search);
            if(params.get('admin_edit_mode'))
                localStorage.setItem('admin-edit-mode', true);

            this.parallaxOffset.dims = [screen.availWidth, screen.availHeight];
            this.$refs['projects-anchor'].addEventListener("click", this.scrollToProjects);
            this.getProjects();
        },

        beforeUnmount(){
            this.$refs['projects-anchor'].removeEventListener("click", this.scrollToProjects);
        }
    }
</script>

<style>
    #projects-anchor{
        transition: 0.2s;
        position: absolute;
        bottom: 15pt;
        color: white;
        text-align: center;
        left: 50%;
        transform: translateX(-50%);
        cursor: pointer;
    }

    #projects-anchor h3{
        font-family: 'Special Elite', sans-serif;
    }

    #services{
        margin-top: 25pt;
        margin-bottom: 25pt;
    }

    .service{
        display: block;
        margin-bottom: 20pt;
        width: 220pt;
        margin-left: calc(50% - 110pt);
        background-color: rgb(25, 25, 25);
        color: white;
        text-align: center;
        box-shadow: 2px 4px 8px #888888;
        border-radius: 8pt;
    }

    .service h2, .service p{
        padding: 0 10pt;
    }

    .service h2{
        padding-top: 10pt;
    }

    .service p{
        padding-bottom: 20pt;
    }

    .service img{
        width: 100%;
        border-radius: 8pt 8pt 0 0;
    }

    #projects{
        background-color: white;
        padding-bottom: 16pt;
        border-top: solid black 2pt;
    }

    #projects .item-showcase, #projects .item-showcase-anim{
        background-color: white;
    }

    #projects .showcase-display{
        display: none;
    }

    #projects #showcase-image-selected{
        border: none;
        border-radius: 4pt;
    }

    #projects .item-info, #projects .radio-label-group, #projects .checkout-button{
        display: none;
    }

    #projects-display{
        background-color: rgb(25, 25, 25, 0.3);
        width: 100%;
        height: 100%;
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        text-align: center;
    }

    #projects-display-image{
        border: solid white 2pt;
        width: calc(100% - 60pt);
        margin-top: 26pt;
        display: block;
        position: relative;
        left: 30pt;
    }

    #projects-display-info{
        transition: 0.4s;
        position: fixed;
        left: 30pt;
        top: 26pt;
        background-color: rgba(0, 0, 0, 0.1);
        color: white;
        pointer-events: none;
    }

    #projects-display-info-inner{
        position: relative;
        transform: translateY(-50%);
    }

    @media only screen and (min-width: 820px){
        #services{
            text-align: center;
        }

        .service{
            width: 200pt;
            margin-left: 12pt;
            margin-right: 12pt;
            display: inline-block;
        }

        #services .service:first-child{
            margin-left: 0;
        }

        #services .service:last-child{
            margin-right: 0;
        }
    }

    @media only screen and (min-width: 1025px){
        .service{
            width: 280pt;
        }
    }

    @media only screen and (orientation: landscape) {
        #projects-display-image{
            width: auto;
            height: calc(100% - 60pt);
        }
    }
</style>