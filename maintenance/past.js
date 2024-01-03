/**
 * rtb script "past"
 * get old real-time list data
 * source: archiv.org
 */

'use strict';

const dir = __dirname + '/../api/';
const today = process.argv[2] || ( new Date() ).toISOString().split( 'T' )[0];

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

/**
 * run script
 */
async function run() {

    console.clear();

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'get old real-time list data' ) );
    console.log( '' );

    if( today <= api.latest ) {

        /**
         * error
         * date must > latest query
         */

        console.log( colors.red( 'ERR: ' + today + ' is older than latest queried date ' + api.latest ) );
        process.exit(1);

    }

    //

};

/**
 * start script
 */

run();