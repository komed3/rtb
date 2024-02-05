/**
 * rtb // real time billionaires
 * 
 * @author komed3
 * @version 1.0.0
 * @license MIT
 */

'use strict';

require( 'dotenv' ).config();

const cmpstr = require( 'cmpstr' );
const isoCountries = require( 'i18n-iso-countries' );
const core = require( './src/core' );
const formatter = require( './src/formatter' );

/**
 * express framework
 */

const express = require( 'express' );

const app = express();

/**
 * static resources
 */

app.use( '/modules', express.static( __dirname + '/node_modules/' ) );

app.use( '/css', express.static( __dirname + '/public/styles' ) );
app.use( '/js', express.static( __dirname + '/public/scripts' ) );
app.use( '/res', express.static( __dirname + '/public/resources' ) );

/**
 * deny access to certain directories
 */

[ 'api', 'app', 'config', 'maintenance', 'src' ].forEach( ( dir ) => {

    app.all( '/' + dir + '/*', ( req, res, next ) => {

        res.status( 300 ).send( 'Access Forbidden!' );

    } );

} );

/**
 * pug template engine
 */

const pug = require( 'pug' );

/**
 * routing
 */

const routes = require( './config/routes' );

routes.forEach( ( route ) => {

    app.get( route[0], ( req, res ) => {

        try {

            /**
             * load API
             */

            const api = require( './api/endpoint' );

            /**
             * locals
             */

            let file = route[1];

            res.locals.isoc = isoCountries;
            res.locals.core = core;
            res.locals.formatter = formatter;
            res.locals.api = api;

            res.locals.global = {
                request: req.query,
                query: ( req.query.q || '' ).trim(),
                file: route[1],
                nav: route[2] || route[1]
            };

            /**
             * process pages
             */

            switch( route[1] ) {

                /**
                 * error 404 page
                 */
                case '404':

                    res.locals.profiles = Object.entries( api.index ).sort(
                        () => 0.5 - Math.random()
                    ).slice( 0, 12 );

                    break;

                /**
                 * home page
                 */
                case 'home':

                    res.locals.movers = api.getMovers( 'latest', 'value', 5, true );

                    res.locals.stats = {
                        count: api.getCSVFile( '/stats/count', 1 ).pop(),
                        total: api.getCSVFile( '/stats/total', 1 ).pop()
                    };

                    res.locals.list = api.getList( 'rtb', { limit: 10 } );

                    break;

                /**
                 * list page
                 */
                case 'list':

                    let list = ( req.params.list || '' ).toLowerCase();

                    if( api.isList( list ) ) {

                        res.locals.global.nav = 'list-' + list;

                        res.locals.listURI = list;
                        res.locals.listName = api.lists[ list ];

                        res.locals.list = api.getList( list, req.query );

                        res.locals.movers = api.getMovers( res.locals.list.date || 'latest', 'value', 5, true );

                    } else {

                        /**
                         * list not given or available
                         * redirect to home
                         */
                        res.redirect( core.url( '/' ) );

                    }

                    break;

                /**
                 * single profile page
                 */
                case 'profile':

                    let uri = ( req.params.uri || '' ).toLowerCase();

                    if( uri in api.index ) {

                        /**
                         * get full profile by URI
                         */

                        let profile = api.getFullProfile( uri );

                        res.locals.profile = profile;
                        res.locals.charts = {
                            rank: profile.history.map( r => [ r[0], r[1] ] ),
                            networth: profile.history.map( r => [ r[0], r[2] ] )
                        };

                    } else if( uri in api.alias ) {

                        /**
                         * uri is alias of another profile
                         * redirect to profile
                         */

                        res.redirect( core.url( '/profile/' + alias[ uri ] ) );
                        return ;

                    } else {

                        /**
                         * profile not given or exists
                         * redirect to home
                         */

                        res.redirect( core.url( '/' ) );
                        return ;

                    }

                    break;

                /**
                 * daily movers page
                 */
                case 'movers':

                    res.locals.wl = api.getMovers( 'latest', 'value', 5, true );

                    res.locals.charts = {
                        winner: api.getCSVFile( '/movers/value/winner/_list' ).reverse().slice( 0, 48 ),
                        loser: api.getCSVFile( '/movers/value/loser/_list' ).reverse().slice( 0, 48 )
                    };

                    break;

                /**
                 * search (results) page
                 */
                case 'search':

                    let query = res.locals.global.query.toLowerCase(),
                        searchPage = parseInt( req.query.page || 1 );

                    if( query.length > 1 ) {

                        let results = [];

                        for( const [ uri, p ] of Object.entries( api.index ) ) {

                            if(
                                uri.includes( query ) ||
                                p.name.toLowerCase().includes( query ) ||
                                cmpstr.diceCoefficient( p.name, query, 'si' ) > 0.8
                            ) {

                                results.push( {
                                    uri: uri,
                                    name: p.name
                                } );

                            }

                        }

                        res.locals.search = {
                            count: results.length,
                            page: searchPage,
                            maxPage: Math.ceil( results.length / 36 ),
                            results: results.slice(
                                ( searchPage - 1 ) * 36,
                                searchPage * 36
                            )
                        };

                    } else {

                        /**
                         * no or empty search query
                         * redirect to home
                         */

                        res.redirect( core.url( '/' ) );
                        return ;

                    }

                    break;

                /**
                 * top 10 richest billionaires page
                 */
                case 'top10':

                    res.locals.top10 = api.getJSONFile( '/stats/top10' );

                    break;

                /**
                 * (general) statistic page
                 */
                case 'stats':

                    res.locals.charts = {
                        count: api.getCSVFile( '/stats/count' ),
                        total: api.getCSVFile( '/stats/total' ),
                        woman: api.getCSVFile( '/stats/woman' ),
                        selfMade: api.getJSONFile( '/stats/selfMade' ),
                        agePyramid: api.getJSONFile( '/stats/agePyramid' ),
                        maritalStatus: api.getJSONFile( '/stats/maritalStatus' ),
                        children: api.getJSONFile( '/stats/children' ).short
                    };

                    res.locals.stats = {
                        count: res.locals.charts.count.slice(-1)[0],
                        total: res.locals.charts.total.slice(-1)[0],
                        woman: res.locals.charts.woman.slice(-1)[0]
                    };

                    res.locals.map = api.getCSVFile( '/stats/country/_list' ).map( ( r ) => {
                        return { id: r[0], y: r[1] };
                    } );

                    break;

                /**
                 * stats list page
                 */
                case 'stats-list':

                    res.locals.base = route[2];
                    res.locals.name = {
                        country: {
                            singular: 'Country',
                            plural: 'Countries'
                        },
                        industry: {
                            singular: 'Industry',
                            plural: 'Industries'
                        }
                    }[ route[2] ];

                    res.locals.list = api.getCSVFile( '/stats/' + route[2] + '/_list' );

                    break;

                /**
                 * stats list page
                 */
                case 'stats-single':

                    res.locals.base = route[2];
                    res.locals.singleKey = req.params.single;
                    res.locals.name = {
                        country: 'Countries',
                        industry: 'Industries'
                    }[ route[2] ];

                    res.locals.single = api.indexes[ route[2] ][ req.params.single ];

                    let history = api.getCSVFile( '/stats/' + route[2] + '/' + req.params.single ),
                        pct = 0;

                    res.locals.charts = {
                        count: history.map( r => [ r[0], r[1] ] ),
                        networth: history.map( r => [ r[0], r[2] ] ),
                        change: history.map( r => [ r[0], ( pct += parseFloat( r[3] ) ) ] )
                    };

                    res.locals.latest = history.splice( -1 )[0];

                    res.locals.list = api.getList( 'rtb', {
                        [ route[2] ]: req.params.single,
                        limit: 10
                    } );

                    break;

                /**
                 * (single) filter page
                 */
                case 'filter':

                    let filterIndex = api.getJSONFile( '/filter/_index' );

                    if( req.params.filter in filterIndex._global ) {

                        res.locals.name = filterIndex._global[ req.params.filter ];
                        res.locals.profiles = api.getJSONFile( '/filter/' + req.params.filter );

                    } else if(
                        req.params.filter in filterIndex &&
                        req.params.single in filterIndex[ req.params.filter ].index
                    ) {

                        res.locals.name = filterIndex[ req.params.filter ].index[ req.params.single ];
                        res.locals.profiles = api.getJSONFile( '/filter/' + req.params.filter + '/' + req.params.single );

                    } else {

                        /**
                         * filter does not exists or not given
                         * redirect to filter list page
                         */
                        res.redirect( core.url( '/filter' ) );
                        return ;

                    }

                    res.locals.count = res.locals.profiles.length;
                    res.locals.maxPage = Math.ceil( res.locals.count / 36 );
                    res.locals.page = req.query.page || 1;

                    res.locals.profiles = res.locals.profiles.slice(
                        36 * ( res.locals.page - 1 ),
                        36 * res.locals.page
                    );

                    break;

                /**
                 * filter list page
                 */
                case 'filter-all':

                    res.locals.filter = api.getJSONFile( '/filter/_index' );

                    break;

            }

            /**
             * render output + send to client
             */

            res.status( 200 ).send(
                pug.renderFile(
                    __dirname + '/app/' + file + '.pug',
                    res.locals
                )
            );

        } catch ( err ) {

            /**
             * catch server error
             */

            res.status( 500 ).send(
                'ERROR: ' + err
            );

        };

    } );

} );

/**
 * 404 redirect
 */

app.all( '*', ( req, res ) => {

    res.redirect( core.url( '/404' ) );

} );

/**
 * start web server
 */

const server = app.listen( process.env.port || 3000 );