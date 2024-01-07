/**
 * rtb script "annual"
 * create annual report for profiles
 */

'use strict';

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

api.updateIndex();

const profiles = Object.keys( api.index );

const year = process.argv.includes( '--year' )
    ? process.argv[ process.argv.indexOf( '--year' ) + 1 ] || ( new Date() ).getFullYear() - 1
    : ( new Date() ).getFullYear() - 1;

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

        let history = api.getCSVFile( path + 'history' ).filter( r => r[0].includes( year ) ),
            dayCount = history.length;

        if( dayCount ) {

            let annual = api.getJSONFile( path + 'annual' );

            let first = history[0], last = history[ dayCount - 1 ];

            /**
             * create annual report
             */

            let rank = history.map( r => r[1] ),
                ntw = history.map( r => r[2] );

            let report = {
                rank: {
                    latest: last[1] || null,
                    first: first[1] || null,
                    diff: parseInt( first[1] - last[1] ),
                    average: parseInt( rank.reduce(
                        ( a, c ) => a + c, 0
                    ) / dayCount ),
                    max: Math.min( ...rank ) || null,
                    min: Math.max( ...rank ) || null,
                    range: null
                },
                networth: {
                    latest: last[2],
                    first: first[2] || null,
                    diff: Number( parseFloat( last[2] - first[2] ).toFixed(3) ),
                    average: Number( parseFloat( ntw.reduce(
                        ( a, c ) => a + c, 0
                    ) / dayCount ).toFixed(3) ),
                    max: Number( parseFloat( Math.max( ...ntw ) ).toFixed(3) ),
                    min: Number( parseFloat( Math.min( ...ntw ) ).toFixed(3) ),
                    range: 0
                }
            };

            report.networth.range = Number( parseFloat( report.networth.max - report.networth.min ).toFixed(3) );

            if( report.rank.max && report.rank.min ) {

                report.rank.range = parseInt( report.rank.min - report.rank.max );

            }

            annual[ year ] = report;

            /**
             * save annual report
             */

            fs.writeFileSync(
                __dirname + '/../api' + path + 'annual',
                JSON.stringify( Object.keys( annual ).sort().reduce( ( a, b ) => ( {
                    ...a, [ b ]: annual[ b ]
                } ), {} ), null, 2 ),
                { flag: 'w' }
            );

        }

        logging.update();

    } );

    logging.finish();

};

/**
 * create annual report
 */

run();