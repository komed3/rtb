/**
 * rtb // real time billionaires
 * 
 * @author komed3
 * @version 1.0.0
 * @license MIT
 */

'use strict';

const fs = require( 'fs' );

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
 * pug template engine
 */

const pug = require( 'pug' );

/**
 * routing
 */

const routes = require( './config/routes' );

routes.forEach( ( route ) => {

    //

} );

/**
 * start web server
 */

const server = app.listen( 3000 );