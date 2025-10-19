<template>
    <footer>
        <div id="footer-top">&#169; Copyright 2023 | Rustic &amp; Redefined | All Rights Reserved</div>
        <div class="footer-splash" id="footer-splash-mobile">
            <a href="https://www.intivatechnologies.ca" target="_blank">
                <image-loader path="logo/intiva_splash.png" alt-value="Intiva Technologies" />
            </a>
        </div>
        <div class="footer-splash" id="footer-splash-desktop">
            <a href="https://www.intivatechnologies.ca" target="_blank">
                <span id="splash-label">Powered By</span>
                <image-loader path="logo/intiva_frame.png" id="splash-frame" alt-value="Intiva Technologies" />
                <image-loader path="logo/intiva_frame_hovered.png" id="splash-frame-hovered" alt-value="Intiva Technologies" />
            </a>
        </div>
    </footer>
</template>

<script>
    import ImageLoader from '../image/ImageLoader.vue';

    export default {
        components: {
            ImageLoader
        }
    }
</script>

<style>
    footer{
        background-color: rgb(25, 25, 25);
        text-align: center;
        color: white;
        font-size: 12pt;
        padding: 14pt 25pt 12pt 25pt;
        margin-top: -1px;
    }

    #footer-top{
        margin-bottom: 10pt;
    }

    .footer-splash#footer-splash-mobile img{
        width: 160pt;
    }

    .footer-splash#footer-splash-desktop{
        display: none;
    }

    @media only screen and (min-width: 740px) and (min-height: 950px){
        footer{
            font-size: 16pt;
        }

        .footer-splash#footer-splash-mobile img{
            width: 180pt;
        }
    }

    @media only screen and (min-width: 1025px){
        footer{
            text-align: left;
            padding: 5pt;
            padding-bottom: 0;
        }

        .footer-splash#footer-splash-mobile{
            display: none;
        }

        .footer-splash#footer-splash-desktop{
            display: inline-block;
        }

        .footer-splash#footer-splash-desktop img{
            width: 32pt;
        }

        #footer-splash-desktop a{
            text-decoration: none;
        }

        #footer-top{
            margin-top: 7pt;
            left: 50%;
            transform: translateX(-50%);
        }

        #footer-top, #splash-frame{
            position: absolute;
        }

        #splash-frame, #splash-frame-hovered{
            margin-left: 3pt;
        }

        #splash-frame-hovered{
            transition: 0.4s;
            position: relative;
            z-index: 1;
            opacity: 0;
        }

        #splash-frame-hovered:hover, #splash-frame-hovered:active{
            opacity: 1;
        }

        #splash-label{
            display: inline-block;
            text-decoration: none;
            color: white;
            font-family: 'Special Elite', sans-serif;
            margin-right: 8pt;
            position: relative;
            bottom: 14pt;
            left: 3pt;
        }
    }
</style>