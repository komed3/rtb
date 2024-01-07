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
 * delete file
 * @param {String} file path to file
 */
const deleteFile = ( file ) => {

    if( fs.existsSync( file ) ) {

        fs.unlinkSync( file );

    }

};

/**
 * delete date from CSV file
 * @param {String} file path to file
 * @param {Int} field date field
 */
const deleteRow = ( file, field = 0 ) => {

    api.saveCSVFile(
        file,
        api.getCSVFile( file ).filter(
            r => r[ field ] != date
        )
    );

};

/**
 * delete day
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'delete day ' + date ) );
    console.log( '' );

    /**
     * delete date from real-time list & movers
     */

    logging.next(
        '[1/3] delete date from real-time list & movers',
        6, 'steps'
    );

    deleteRow( '/availableDays' );

    logging.update();

    deleteFile( __dirname + '/../api/list/rtb/' + date );

    logging.update();

    deleteFile( __dirname + '/../api/movers/value/winner/' + date );

    logging.update();

    deleteFile( __dirname + '/../api/movers/value/loser/' + date );

    logging.update();

    deleteFile( __dirname + '/../api/movers/pct/winner/' + date );

    logging.update();

    deleteFile( __dirname + '/../api/movers/pct/loser/' + date );

    logging.update();

    /**
     * delete date from profiles
     */

    let profiles = Object.keys( api.index );

    logging.next(
        '[2/3] delete date from profiles',
        profiles.length, 'profiles'
    );

    profiles.forEach( ( uri ) => {

        deleteRow( '/profile/' + uri + '/history' );

        logging.update();

    } );

    /**
     * delete date from stats
     */

    logging.next(
        '[3/3] delete date from stats',
        3, 'steps'
    );

    Object.keys( api.indexes ).forEach( ( type ) => {

        let index = Object.keys( api.indexes[ type ] );

        logging.addTotal( index.length );

        index.forEach( ( key ) => {

            deleteRow( '/stats/' + type + '/' + key );

            logging.update();

        } );

    } );

    deleteRow( '/stats/count' );

    logging.update();

    deleteRow( '/stats/woman' );

    logging.update();

    deleteRow( '/stats/total' );

    logging.update();
    logging.finish();

    /**
     * recommendation
     */

    console.log( '' );
    console.log( 'recommended to run:' );
    console.log( colors.yellow( 'node annual.js --year ' + date.split( '-' )[0] ) );
    console.log( '' );

};

/**
 * delete day
 */

run();