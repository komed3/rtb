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
 * search for mergeable profiles
 */
const search = () => {

    console.log( 'Search for mergeable profiles using Sørensen-Dice coefficient:' );

    let profiles = Object.keys( JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ) );

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
 * merge two profiles
 * @param {String} from profile uri to merge from
 * @param {String} to profile uri to merge into
 */
const merge = ( from, to ) => {

    //

};

console.log( 'Real-time billionaires' );
console.log( colors.yellow( 'merge profiles' ) );
console.log( '' );

/**
 * check mode and given args
 */

if( process.argv.length == 2 ) {

    search();

} else if( process.argv.length == 4 ) {

    merge(
        process.argv[3].toLowerCase(),
        process.argv[4].toLowerCase()
    );

} else {

    console.log( colors.red( 'wrong parameters given' ) );
    console.log( '>> use ' + colors.yellow( 'node merge.js' ) + ' for searching' );
    console.log( '>> use ' + colors.yellow( 'node merge.js [FROM] [TO]' ) + ' for merging [FROM] into [TO]' );

}