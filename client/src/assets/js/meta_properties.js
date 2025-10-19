var meta_properties = {
    getInfo: title => {
        return {
            title: title,
            titleTemplate: '%s | Rustic & Redefined',
            htmlAttrs: {
                lang: 'en-US'
            },
            meta: [
                { charset: 'utf-8' },
                { name: 'Rustic & Redefined', content: 'We take antiques that have been '
                    + 'off the shelf and restore them into specialty items.' },
                { property: 'og:title', content: 'Rustic & Redefined - Restored antiques and redefined with a modern approach' },
                { property: 'og:site_name', content: 'Rustic & Redefined' },
                { property: 'og:type', content: 'website' }
            ]
        };
    }
};

export default meta_properties;