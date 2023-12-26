/**
 * rtb script "rename"
 * rename profile
 */

'use strict';

const dir = __dirname + '/../api/profile';

const colors = require( 'ansi-colors' );
const fs = require( 'fs' );

console.log( 'Real-time billionaires' );
console.log( '' );

if( process.argv.length == 4 ) {

    let index = fs.existsSync( dir + '_index' )
        ? JSON.parse( fs.readFileSync( dir + '_index' ) )
        : {};

    let alias = fs.existsSync( dir + '_alias' )
        ? JSON.parse( fs.readFileSync( dir + '_alias' ) )
        : {};

} else {

    console.log( colors.red( 'ERR: wrong arguments' ) );
    console.log( 'use "node rename.js [FROM] [TO]"' );

}