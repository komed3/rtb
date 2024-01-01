/**
 * rtb // real time billionaires
 * 
 * @author komed3
 * @version 1.0.0
 * @license MIT
 */

'use strict';

const today = ( new Date() ).toISOString().split( 'T' )[0];

const cmpstr = require( 'cmpstr' );
const isoCountries = require( 'i18n-iso-countries' );

const core = require( './src/core' );
const formatter = require( './src/formatter' );
const api = require( './api/endpoint' );

/**
 * express framework
 */

const express = require( 'express' );

const app = express();

/**
 * static resources
 */

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

            let file = route[1];

            res.locals.isoc = isoCountries;
            res.locals.core = core;
            res.locals.formatter = formatter;
            res.locals.api = api;

            res.locals.global = {
                query: ( req.query.q || '' ).trim(),
                file: route[1],
                nav: route[2] || route[1]
            };

            /**
             * process pages
             */

            switch( route[1] ) {

                /**
                 * list page
                 */
                case 'list':

                    let list = ( req.params.list || '' ).toLowerCase();

                    if( api.isList( list ) ) {

                        res.locals.global.nav = 'list-' + list;

                        res.locals.list = api.getList( list, req.query );

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
                 * search (results) page
                 */
                case 'search':

                    let query = res.locals.global.query.toLowerCase();

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
                            results: results,
                            count: results.length
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

                    break;

                /**
                 * stats list page
                 */
                case 'stats-list':

                    res.locals.base = route[2];
                    res.locals.name = {
                        country: 'Countries',
                        industry: 'Industries'
                    }[ route[2] ];

                    res.locals.list = api.getCSVFile( '/stats/' + route[2] + '/_list' );

                    break;

                /**
                 * stats list page
                 */
                case 'stats-single':

                    res.locals.base = route[2];
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

                    res.locals.profiles = api.getJSONFile( '/filter/' + route[2] + '/' + req.params.single ).sort(
                        ( a, b ) => 0.5 - Math.random()
                    ).slice( 0, 12 );

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
 * start web server
 */

const server = app.listen( 3000 );