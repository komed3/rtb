module.exports = [
    [ '/?', 'home' ],
    [ '/404/?', '404' ],
    [ '/country/:single/?', 'stats-single', 'country' ],
    [ '/country/?', 'stats-list', 'country' ],
    [ '/industry/:single/?', 'stats-single', 'industry' ],
    [ '/industry/?', 'stats-list', 'industry' ],
    [ '/list/:list/?', 'list' ],
    [ '/movers/?', 'movers' ],
    [ '/profile/:uri/?', 'profile' ],
    [ '/search/?', 'search' ],
    [ '/stats/?', 'stats' ]
];