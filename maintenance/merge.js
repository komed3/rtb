/**
 * rtb script "merge"
 * merge two profiles
 */

'use strict';

const cmpstr = require( 'cmpstr' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

/**
 * check for mergeable profiles
 */
const check = () => {

    //

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

    check();

} else if( process.argv.length == 4 ) {

    merge(
        process.argv[3].toLowerCase(),
        process.argv[4].toLowerCase()
    );

} else {

    console.log( colors.red( 'wrong parameters given' ) );

}