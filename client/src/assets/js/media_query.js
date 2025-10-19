var media_query = {
    queryNames: ['phone-mini', 'phone', 'tablet', 'tablet-large', 'desktop'],

    querySets: {
        'phone-mini': [385, 750],
        'phone': [420, 930],
        'tablet': [860, 1240],
        'tablet-large': [1024, 1420],
        'desktop': [1440, 1100]
    },

    getQuery(){
        let dims = [screen.availWidth, screen.availHeight], isPortrait = dims[0] <= dims[1];
        let index = isPortrait ? 0 : 1, nIndex = isPortrait ? 1 : 0;
        let querySets = media_query.querySets, queryNames = media_query.queryNames;

        for(let i = 0; i < queryNames.length; i++){
            if(dims[0] <= querySets[queryNames[i]][index]){
                for(let j = 0; j < queryNames.length; j++){
                    if(dims[1] <= querySets[queryNames[j]][nIndex])
                        return queryNames[j];
                }

                return queryNames[i];
            }
        }
        return 'desktop-large';
    },

    getQuerySwitch(){
        let query = media_query.getQuery();
        for(let i = 0; i < media_query.queryNames.length; i++){
            if(query == media_query.queryNames[i])
                return i;
        }
        return media_query.queryNames.length;
    }
};

export default media_query;