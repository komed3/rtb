module.exports = [
    [ '{/}', 'home' ],
    [ '/404{/}', '404' ],
    [ '/api{/}', 'api' ],
    [ '/country/:single{/}', 'stats-single', 'country' ],
    [ '/country{/}', 'stats-list', 'country' ],
    [ '/filter/:filter/:single{/}', 'filter' ],
    [ '/filter/:filter{/}', 'filter' ],
    [ '/filter{/}', 'filter-all', 'filter' ],
    [ '/industry/:single{/}', 'stats-single', 'industry' ],
    [ '/industry{/}', 'stats-list', 'industry' ],
    [ '/list/:list{/}', 'list' ],
    [ '/movers{/}', 'movers' ],
    [ '/privacy{/}', 'privacy' ],
    [ '/profile/:uri{/}', 'profile' ],
    [ '/search{/}', 'search' ],
    [ '/stats{/}', 'stats' ],
    [ '/top10{/}', 'top10' ]
];