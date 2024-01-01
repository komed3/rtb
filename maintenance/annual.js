/**
 * rtb script "annual"
 * create annual report for profiles
 */

'use strict';

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const logging = require( './_logging' );

const profiles = Object.keys( api.index );

/**
 * create annual report
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'create annual report' ) );
    console.log( '' );

    /**
     * generate annual report for each profile
     */

    logging.next(
        'Process profiles and generate stats',
        profiles.length, 'profiles'
    );

    profiles.forEach( ( uri ) => {

        let path = '/profile/' + uri + '/';

        let annual = api.getJSONFile( path + 'annual' ),
            history = api.getCSVFile( path + 'history' );

        //

        logging.update();

    } );

    logging.finish();

};

/**
 * create annual report
 */

run();