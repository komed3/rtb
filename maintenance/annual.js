/**
 * rtb script "annual"
 * create annual report for profiles
 */

'use strict';

const dir = __dirname + '/../api/profile/';

const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

/**
 * create annual report
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'create annual report' ) );
    console.log( '' );

    if( fs.existsSync( dir + 'profile/_index' ) ) {

        /**
         * load profile index
         */

        let profiles = Object.keys( JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ) );

        /**
         * generate stats
         */

        logging.next(
            'Process profiles and generate stats',
            profiles.length, 'profiles'
        );

        profiles.forEach( ( uri ) => {

            //

        } );

        logging.finish();

    } else {

        console.log( colors.red( 'ERR' ) + ' no profiles found' );

    }

};

/**
 * create annual report
 */

run();