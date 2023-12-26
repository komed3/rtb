/**
 * rtb script "rename"
 * rename profile
 */

'use strict';

const dir = __dirname + '/../api/profile/';

const colors = require( 'ansi-colors' );
const fs = require( 'fs' );

console.log( 'Real-time billionaires' );
console.log( '' );

if( process.argv.length == 4 ) {

    let from = process.argv[2],
        to = process.argv[3];

    let index = fs.existsSync( dir + '_index' )
        ? JSON.parse( fs.readFileSync( dir + '_index' ) )
        : {};

    let alias = fs.existsSync( dir + '_alias' )
        ? JSON.parse( fs.readFileSync( dir + '_alias' ) )
        : {};

    if( !( from in index ) ) {

        console.log( colors.yellow( 'ERR: [' + from + '] does not exists' ) );

    } else if( to in index ) {

        console.log( colors.yellow( 'ERR: [' + to + '] allready exists' ) );

    }

} else {

    console.log( colors.yellow( 'ERR: wrong arguments' ) );
    console.log( 'use "node rename.js [FROM] [TO]"' );

}