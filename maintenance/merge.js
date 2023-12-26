/**
 * rtb script "merge"
 * merge two profiles
 */

'use strict';

const dir = __dirname + '/../api/';
const threshold = 0.85;

const cmpstr = require( 'cmpstr' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );

/**
 * fetch profiles index
 */

var profiles = [];

if( fs.existsSync( dir + 'profile/_index' ) ) {

    profiles = Object.keys( JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ) );

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'merge profiles' ) );
    console.log( '' );

} else {

    console.log( colors.red( 'there are no profiles to merge, run "npm update" first' ) );

    process.exit(1);

}

/**
 * search for mergeable profiles
 */
const search = () => {

    console.log( 'Search for mergeable profiles using Sørensen-Dice coefficient (this will take some time):' );

    profiles.forEach( ( uri ) => {

        let results = cmpstr.diceMatch( uri, profiles ).filter(
            p => p.target != uri && p.match > threshold
        );

        if( results.length ) {

            console.log( '' );
            console.log( 'similar profile URIs found for ' + colors.yellow( uri ) + ':' );
            console.log( results );

        }

    } );

};

/**
 * test merging of two profiles
 * @param {String} from profile uri to merge from
 * @param {String} to profile uri to merge into
 */
const test = ( from, to ) => {

    console.log( 'Test merging [' + colors.yellow( from ) + '] into [' + colors.yellow( to ) + ']:' );

    //

};

/**
 * merge two profiles
 * @param {String} from profile uri to merge from
 * @param {String} to profile uri to merge into
 */
const merge = ( from, to ) => {

    console.log( 'Merging [' + colors.yellow( from ) + '] into [' + colors.yellow( to ) + ']:' );

    //

};

/**
 * usage + error handling
 */
const help = ( err = false ) => {

    if( err ) {

        console.log( colors.red( 'ERROR: ' + err ) );

    }

    console.log( '>> use ' + colors.yellow( 'node merge.js --search' ) + ' to search for mergeable profiles' );
    console.log( '>> use ' + colors.yellow( 'node merge.js --test [FROM] [TO]' ) + ' to test merging [FROM] into [TO]' );
    console.log( '>> use ' + colors.yellow( 'node merge.js --merge [FROM] [TO]' ) + ' to merge [FROM] into [TO]' );

};

/**
 * process arguments
 */

if( process.argv.length >= 3 ) {

    switch( process.argv[2] ) {

        case '--search':
            search();
            break;

        case '--help':
            help();
            break;

        case '--test': case '--merge':

            /**
             * check if profiles exists
             */

            if(
                process.argv.length == 5 &&
                profiles.includes( process.argv[3] ) &&
                profiles.includes( process.argv[4] )
            ) {

                switch( process.argv[2] ) {

                    case '--test':
                        test( process.argv[3], process.argv[4] );
                        break;

                    case '--merge':
                        merge( process.argv[3], process.argv[4] );
                        break;

                }

            } else {

                help( 'profiles not found' );

            }

            break;

        default:
            help( 'wrong arguments' );
            break;

    }

} else {

    help( 'no arguments given' );

}