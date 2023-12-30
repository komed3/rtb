module.exports = [
    [ '/profile/:uri/?', 'profile' ],
    [ '/stats/?', 'stats' ],
    [ '/country/:single/?', 'stats-single', 'country' ],
    [ '/country/?', 'stats-list', 'country' ],
    [ '/industry/:single/?', 'stats-single', 'industry' ],
    [ '/industry/?', 'stats-list', 'industry' ]
];