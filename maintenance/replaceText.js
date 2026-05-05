/**
 * rtb script "replaceText"
 * replace a text string in every file of a given directory
 */

'use strict';

const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const path = require( 'path' );
const logging = require( './_logging' );

const args = process.argv.slice( 2 );
const search = args.includes( '--search' )
    ? args[ args.indexOf( '--search' ) + 1 ] || null
    : null;
const replace = args.includes( '--replace' )
    ? args[ args.indexOf( '--replace' ) + 1 ] || null
    : null;
const customDir = args.includes( '--dir' )
    ? args[ args.indexOf( '--dir' ) + 1 ] || null
    : null;

const rootDir = customDir
    ? path.isAbsolute( customDir )
        ? customDir
        : path.join( process.cwd(), customDir )
    : path.join( __dirname, '..', 'api' );

/**
 * walk directory recursively and return all files
 * @param {String} dir
 * @returns {String[]}
 */
const walkDirectory = ( dir ) => {

    return fs.readdirSync( dir, { withFileTypes: true } ).flatMap( ( entry ) => {

        const fullPath = path.join( dir, entry.name );

        if ( entry.isDirectory() ) {

            return walkDirectory( fullPath );

        }

        if ( entry.isFile() ) {

            return [ fullPath ];

        }

        return [];

    } );

};

/**
 * replace all occurrences of search in text
 * @param {String} text
 * @param {String} search
 * @param {String} replacement
 * @returns {String}
 */
const replaceAllOccurrences = ( text, search, replacement ) => {

    return text.split( search ).join( replacement );

};

/**
 * replace text in a file and return replacement count
 * @param {String} filePath
 * @param {String} search
 * @param {String} replacement
 * @returns {Number}
 */
const replaceInFile = ( filePath, search, replacement ) => {

    const content = fs.readFileSync( filePath, 'utf8' );

    if ( ! content.includes( search ) ) {

        return 0;

    }

    const count = content.split( search ).length - 1;
    const updatedContent = replaceAllOccurrences( content, search, replacement );

    fs.writeFileSync( filePath, updatedContent, 'utf8' );

    return count;

};

/**
 * script entrypoint
 */
async function run() {

    if ( ! search || replace === null ) {

        console.log( colors.red( 'Usage:' ) );
        console.log( '  node replaceText.js --search "<text>" --replace "<text>" [--dir <path>]' );
        console.log( '' );
        console.log( 'Example:' );
        console.log( '  node replaceText.js --search "2026-05-05" --replace "2026-05-04"' );
        process.exit( 1 );

    }

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'replace text in ' + rootDir ) );
    console.log( '' );

    const files = walkDirectory( rootDir );

    logging.next(
        '[1/1] search and replace',
        files.length,
        'files'
    );

    let scannedFiles = 0;
    let updatedFiles = 0;
    let totalReplacements = 0;

    files.forEach( ( filePath ) => {

        const relativePath = path.relative( process.cwd(), filePath );
        const count = replaceInFile( filePath, search, replace );

        scannedFiles++;
        logging.update();

        if ( count === 0 ) return;

        updatedFiles++;
        totalReplacements += count;

    } );

    logging.finish();

    console.log( '' );
    console.log( colors.green( 'Finished:' ) );
    console.log( `  searched    ${ files.length } file(s)` );
    console.log( `  updated     ${ updatedFiles } file(s)` );
    console.log( `  replaced    ${ totalReplacements }` );
    console.log( '' );

}

run();
