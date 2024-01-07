/**
 * rtb script "deleteDay"
 * delete a day from lists and profiles
 */

'use strict';

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

const date = process.argv.includes( '--date' )
    ? process.argv[ process.argv.indexOf( '--date' ) + 1 ] || null
    : null;

/**
 * delete day
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'delete day ' + date ) );
    console.log( '' );

    /**
     * delete date from profiles
     */

    let profiles = Object.keys( api.index );

    logging.next(
        '[1/3] delete ' + colors.yellow( date ) + ' from profiles',
        profiles.length, 'profiles'
    );

    profiles.forEach( ( uri ) => {

        let path = '/profile/' + uri + '/history';

        api.saveCSVFile(
            path,
            api.getCSVFile( path ).filter(
                r => r[0] != date
            )
        );

        logging.update();

    } );

    logging.finish();

};

/**
 * delete day
 */

run();