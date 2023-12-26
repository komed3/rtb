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

if( fs.existsSync( dir + 'profile/_index' ) ) {

    var index = JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ),
        profiles = Object.keys( index );

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

    let path = dir + 'profile/',
        files = {};

    /**
     * check for necessary files
     */

    console.log( '' );
    console.log( 'Check for necessary files:' );

    [
        to + '/assets',
        to + '/bio',
        to + '/history',
        from + '/history',
        to + '/info',
        to + '/latest',
        to + '/rank',
        to + '/related'
    ].forEach( ( file ) => {

        files[ file ] = fs.existsSync( path + file );

        console.log(
            '[' + file + '] >> ' + ( files[ file ]
                ? colors.green( 'OK' )
                : colors.red( 'ERR' ) )
        );

    } );

    /**
     * check mergable history
     */

    console.log( '' );
    console.log( 'Check mergable history for dublicate entries:' );

    if( files[ to + '/history' ] && files[ from + '/history' ] ) {

        let history_from = fs.readFileSync( path + from + '/history' )
                .toString().split( '\r\n' ).filter( a => a )
                .map( a => a.split( ' ' )[0] );

        let history_to = fs.readFileSync( path + to + '/history' )
                .toString().split( '\r\n' ).filter( a => a )
                .map( a => a.split( ' ' )[0] );

        let dublicates = history_from.filter( a => history_to.includes( a ) );

        if( dublicates.length ) {

            console.log( colors.yellow( 'WARN: dublicates found' ) );
            console.log( dublicates );

        } else {

            console.log( colors.green( 'OK' ) );

        }

    } else if ( files[ to + '/history' ] ) {

        console.log( colors.green( 'OK' ) );

    } else {

        console.log( colors.red( 'ERR: files not found' ) );

    }

    /**
     * check profiles similarity
     */

    console.log( '' );
    console.log( 'Check profiles similarity:' );

    if( files[ to + '/info' ] && fs.existsSync( path + from + '/info' ) ) {

        let info_from = JSON.parse( fs.readFileSync( path + from + '/info' ) ),
            info_to = JSON.parse( fs.readFileSync( path + to + '/info' ) );

        let test = [ ...new Set( Object.keys( info_to ).concat( Object.keys( info_from ) ) ) ];

        test.forEach( ( key ) => {

            let similarity = cmpstr.diceCoefficient(
                JSON.stringify( key in info_from ? info_from[ key ] : '' ),
                JSON.stringify( key in info_to ? info_to[ key ] : '' )
            );

            console.log( key + ' >> ' + ( similarity == 1
                ? colors.green( 'OK' )
                : colors.yellow( 'WARN: ' + Math.round( similarity * 100 ) + '%' ) )
            );

            if( similarity < 1 ) {

                console.log( ' [FROM]', info_from[ key ] || null );
                console.log( ' [TO]', info_to[ key ] || null );

            }

        } );

    } else if ( files[ to + '/info' ] ) {

        console.log( colors.green( 'OK' ) );

    } else {

        console.log( colors.red( 'ERR: files not found' ) );

    }

};

/**
 * merge two profiles
 * @param {String} from profile uri to merge from
 * @param {String} to profile uri to merge into
 */
const merge = ( from, to ) => {

    console.log( 'Merging [' + colors.yellow( from ) + '] into [' + colors.yellow( to ) + ']:' );

    let path = dir + 'profile/';

    /**
     * merge history
     */

    console.log( '' );
    console.log( 'Merge history' );

    if(
        fs.existsSync( path + from + '/history' ) &&
        fs.existsSync( path + to + '/history' )
    ) {

        let history_from = fs.readFileSync( path + from + '/history' )
                .toString().split( '\r\n' ).filter( a => a )
                .map( a => a.split( ' ' ) );

        let history_to = fs.readFileSync( path + to + '/history' )
                .toString().split( '\r\n' ).filter( a => a )
                .map( a => a.split( ' ' ) );

        let history = {};

        history_from.forEach( ( r ) => {

            history[ r[0] ] = r.join( ' ' );

        } );

        history_to.forEach( ( r ) => {

            if( r[0] in history ) {

                console.log( colors.yellow( 'WARN: dublicate found for ' + r[0] ) );

            }

            history[ r[0] ] = r.join( ' ' );

        } );

        fs.writeFileSync(
            path + to + '/history',
            Object.values( history ).join( '\r\n' ) + '\r\n',
            { flag: 'w' }
        );

        console.log( colors.green( 'OK' ) );

    } else {

        console.log( colors.red( 'ERR: files not found' ) )

    }

    /**
     * delete old profile
     */

    console.log( '' );
    console.log( 'Delete old profile [' + colors.yellow( from ) + ']' );

    fs.rmSync( path + from, { recursive: true, force: true } );

    delete index[ from ];

    fs.writeFileSync(
        path + '_index',
        JSON.stringify( index, null, 2 ),
        { flag: 'w' }
    );

    console.log( colors.green( 'OK' ) );

    /**
     * save alias
     */

    console.log( '' );
    console.log( 'Save alias: [' + colors.yellow( from ) + '] >> [' + colors.yellow( to ) + ']' );

    let alias = {};

    if( fs.existsSync( path + '_alias' ) ) {

        alias = JSON.parse( fs.readFileSync( path + '_alias' ) );

    }

    alias[ from ] = to;

    fs.writeFileSync(
        path + '_alias',
        JSON.stringify( alias, null, 2 ),
        { flag: 'w' }
    );

    console.log( colors.green( 'OK' ) );

    /**
     * renew profile info
     */

    if( fs.existsSync( path + to + '/updated' ) ) {

        fs.unlinkSync( path + to + '/updated' );

    }

    console.log( '' );
    console.log( 'Recommended: run the following command' );
    console.log( colors.yellow( 'npm run info' ) );

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