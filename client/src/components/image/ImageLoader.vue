<template>
    <img :src="processedPath" :alt="altValue" ref="image" />
</template>

<script>
    import Path from '../Path.vue';

    export default {
        extends: Path,

        props: {
            altValue: ""
        }
    }
</script>