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

        console.log( colors.red( 'ERR: [' + from + '] does not exists' ) );

    } else if( to in index ) {

        console.log( colors.red( 'ERR: [' + to + '] allready exists' ) );

    } else if( from in alias ) {

        console.log( colors.red( 'ERR: [' + from + '] is allready part of aliases:' ) );
        console.log( '[' + from + '] redirects to [' + alias[ from ] + ']' );

    } else {

        /**
         * rename profile
         */

        console.log( 'rename ' + colors.yellow( '[' + from + ']' ) + ' to ' + colors.yellow( '[' + to + ']' ) );
        console.log( '' );

        /**
         * replace uri in profile info
         */

        if( fs.existsSync( dir + from + '/info' ) ) {

            let info = JSON.parse( fs.readFileSync( dir + from + '/info' ) );

            info.uri = to;

            fs.writeFileSync(
                dir + from + '/info',
                JSON.stringify( info, null, 2 ),
                { flag: 'w' }
            );

            console.log( '>> replace uri ' + colors.green( 'OK' ) );

        }

        /**
         * rename folder
         */

        fs.renameSync( dir + from + '/', dir + to + '/' );

        console.log( '>> rename folder ' + colors.green( 'OK' ) );

        /**
         * replace index entry
         */

        index[ to ] = index[ from ];
        delete index[ from ];

        console.log( '>> replace index entry ' + colors.green( 'OK' ) );

        /**
         * add new alias
         */

        alias[ from ] = to;

        console.log( '>> add alias ' + colors.green( 'OK' ) );

        /**
         * check if from is alias of another profile
         * replace this alias with the new one
         */

        if( Object.values( alias ).includes( from ) ) {

            console.log( colors.yellow( 'WARN: [' + from + '] is alias of another profile' ) );

            let old = Object.keys( alias ).find( k => alias[ k ] === from );

            alias[ old ] = to;

        }

        /**
         * save index + aliases
         */

        fs.writeFileSync(
            dir + '/_index',
            JSON.stringify( Object.keys( index ).sort().reduce( ( a, b ) => ( {
                ...a, [ b ]: index[ b ]
            } ), {} ), null, 2 ),
            { flag: 'w' }
        );

        fs.writeFileSync(
            dir + '/_alias',
            JSON.stringify( Object.keys( alias ).sort().reduce( ( a, b ) => ( {
                ...a, [ b ]: alias[ b ]
            } ), {} ), null, 2 ),
            { flag: 'w' }
        );

        console.log( '>> save index + aliases ' + colors.green( 'OK' ) );
        console.log( colors.green( 'DONE' ) );

    }

} else {

    console.log( colors.red( 'ERR: wrong arguments' ) );
    console.log( 'use "node rename.js [FROM] [TO]"' );

}