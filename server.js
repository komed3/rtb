/**
 * rtb // real time billionaires
 * 
 * @author komed3
 * @version 1.0.0
 * @license MIT
 */

'use strict';

const today = ( new Date() ).toISOString().split( 'T' )[0];

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
app.use( '/img', express.static( __dirname + '/public/images' ) );

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

            res.locals.core = core;
            res.locals.formatter = formatter;
            res.locals.api = api;

            res.locals.global = {};
            res.locals.global.today = today;

            /**
             * process pages
             */

            switch( route[1] ) {

                case 'profile':

                    let uri = ( req.params.uri || '' ).toLowerCase();

                    if( uri in api.index ) {

                        /**
                         * get full profile by URI
                         */

                        let profile = api.getFullProfile( uri );

                        res.locals.profile = profile;

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