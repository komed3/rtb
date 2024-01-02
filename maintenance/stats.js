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

        let selfMade = {
            'Inherited and no increase': 0,
            'Inherited and managing': 0,
            'Inherited and helping to increase': 0,
            'Inherited and meaningful increase': 0,
            'Inherited small, become big': 0,
            'Hired hand or hands-off investor': 0,
            'Self-made from moneyed background': 0,
            'Self-made from middle-class': 0,
            'Self-made from little to nothing': 0,
            'Self-made with major obstacles': 0
        }, selfMadeKeys = Object.keys( selfMade );

        let agePyramid = {
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
        };

        let scatter = {
            m: [],
            f: []
        };

        let maritalStatus = {};

        let children = {
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

            let path = dir + 'profile/' + uri + '/';

            let info = fs.existsSync( path + 'info' )
                ? JSON.parse( fs.readFileSync( path + 'info' ) )
                : {};

            /**
             * skip deceased profiles
             */

            if( !( info.deceased || false ) ) {

                /**
                 * self-made score
                 */

                if( 'selfMade' in info && info.selfMade.rank ) {

                    let key = parseInt( info.selfMade.rank ) - 1;

                    if( key in selfMadeKeys ) {

                        selfMade[ selfMadeKeys[ key ] ]++;

                    }

                }

                /**
                 * age pyramid and scatter
                 */

                if( info.gender && info.birthDate ) {

                    let age = Math.floor( ( new Date(
                        new Date() - new Date( info.birthDate )
                    ).getFullYear() - 1970 ) / 10 ) * 10;

                    if( age in agePyramid[ info.gender ] ) {

                        agePyramid[ info.gender ][ age ]++;

                    }

                    let networth = fs.existsSync( path + 'latest' )
                        ? JSON.parse( fs.readFileSync( path + 'latest' ) ).networth
                        : 0;

                    if( networth >= 1000 ) {

                        scatter[ info.gender ].push( {
                            x: age,
                            y: networth,
                            uri: uri,
                            name: info.name
                        } );

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
            5, 'steps'
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
            dir + 'stats/scatter',
            JSON.stringify( scatter, null, 2 ),
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