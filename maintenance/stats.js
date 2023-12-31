/**
 * rtb script "stats"
 * create / renew stats
 */

'use strict';

const dir = __dirname + '/../api/';

const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

/**
 * run info updater
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'update / renew stats' ) );
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
            '[1/2] Process profiles and generate stats',
            profiles.length, 'profiles'
        );

        let selfMade = {},
            agePyramid = {
                m: {
                    10: 0, 20: 0, 30: 0,
                    40: 0, 50: 0, 60: 0,
                    70: 0, 80: 0, 90: 0
                },
                f: {
                    10: 0, 20: 0, 30: 0,
                    40: 0, 50: 0, 60: 0,
                    70: 0, 80: 0, 90: 0
                }
            },
            maritalStatus = {},
            children = {
                full: {},
                short: {
                    'none': 0,
                    'one': 0,
                    'two': 0,
                    'three': 0,
                    'four': 0,
                    '5-to-10': 0,
                    'over-10': 0
                }
            };

        profiles.forEach( ( uri ) => {

            let path = dir + 'profile/' + uri + '/info';

            let info = fs.existsSync( path )
                ? JSON.parse( fs.readFileSync( path ) )
                : {};

            /**
             * skip deceased profiles
             */

            if( !( info.deceased || false ) ) {

                /**
                 * self-made score
                 */

                if( 'selfMade' in info && info.selfMade.rank ) {

                    if( info.selfMade.rank in selfMade ) {

                        selfMade[ info.selfMade.rank ]++;

                    } else {

                        selfMade[ info.selfMade.rank ] = 1;

                    }

                }

                /**
                 * age pyramid
                 */

                if( info.gender && info.birthDate ) {

                    let age = Math.floor( ( new Date(
                        new Date() - new Date( info.birthDate )
                    ).getFullYear() - 1970 ) / 10 ) * 10;

                    if( age in agePyramid[ info.gender ] ) {

                        agePyramid[ info.gender ][ age ]++;

                    }

                }

                /**
                 * marital status
                 */

                if( info.maritalStatus ) {

                    info.maritalStatus.split( ',' ).map( ( status ) => {

                        status = status
                            .toLowerCase()
                            .trim()
                            .replace( /[^a-z0-9-]/g, '-' )
                            .replace( /-{1,}/g, '-' );

                        if( status in maritalStatus ) {

                            maritalStatus[ status ]++;

                        } else {

                            maritalStatus[ status ] = 1;

                        }

                    } );

                }

                /**
                 * number of children
                 */

                if( 'children' in info ) {

                    if( info.children in children.full ) {

                        children.full[ info.children ]++;

                    } else {

                        children.full[ info.children ] = 1;

                    }

                    children.short[ [
                        'none', 'one', 'two', 'three', 'four', '5-to-10', 'over-10'
                    ][
                        info.children > 10
                            ? 6
                            : info.children > 4
                                ? 5
                                : info.children
                    ] ]++;

                }

            }

            logging.update();

        } );

        /**
         * save generated stats
         */

        logging.next(
            '[2/2] Save generated stats',
            4, 'steps'
        );

        fs.writeFileSync(
            dir + 'stats/selfMade',
            JSON.stringify( selfMade, null, 2 ),
            { flag: 'w' }
        );

        logging.update();

        fs.writeFileSync(
            dir + 'stats/agePyramid',
            JSON.stringify( agePyramid, null, 2 ),
            { flag: 'w' }
        );

        logging.update();

        fs.writeFileSync(
            dir + 'stats/maritalStatus',
            JSON.stringify( maritalStatus, null, 2 ),
            { flag: 'w' }
        );

        logging.update();

        fs.writeFileSync(
            dir + 'stats/children',
            JSON.stringify( children, null, 2 ),
            { flag: 'w' }
        );

        logging.finish();

    } else {

        console.log( colors.red( 'ERR' ) + ' no profiles found' );

    }

};

/**
 * start stats updater
 */

run();