/**
 * rtb // api endpoint
 */

'use strict';

const fs = require( 'fs' );

/**
 * get JSON content from file
 * @param {String} file path to file
 * @returns JSON content
 */
const getJSONFile = ( file ) => {

    return fs.existsSync( __dirname + '/' + file )
        ? JSON.parse( fs.readFileSync( __dirname + '/' + file ) )
        : {};

};

/**
 * get CSV content from file
 * @param {String} file path to file
 * @param {String} delimiter value delimiter
 * @param {String} newLine new line delimiter
 * @returns CSV content
 */
const getCSVFile = ( file, delimiter = ' ', newLine = '\r\n' ) => {

    return fs.existsSync( __dirname + '/' + file )
        ? fs.readFileSync( __dirname + '/' + file )
            .toString()
            .split( newLine )
            .filter( r => r )
            .map( r => r.split( delimiter ) )
        : [];

};

/**
 * resolve URI
 * @param {String|Null} uri request URI
 * @returns resolved URI
 */
const resolveURI = ( uri ) => {

    if( !uri || uri == null ) {

        return null;

    }

    let i = 20;

    while( !( uri in index ) && --i > 0 ) {

        if( uri in alias ) {

            uri = alias[ uri ];

        } else {

            return null;

        }

    }

    return uri;

};

/**
 * get profile by URI
 * @param {String} uri profile URI
 * @returns profile object
 */
const getFullProfile = ( uri ) => {

    let path = '/profile/' + uri + '/';

    if( fs.existsSync( __dirname + path ) ) {

        return {
            info: getJSONFile( path + 'info' ),
            bio: getJSONFile( path + 'bio' ),
            rank: getJSONFile( path + 'rank' ),
            history: getCSVFile( path + 'history' ),
            assets: getJSONFile( path + 'assets' ),
            latest: getJSONFile( path + 'latest' )
        };

    }

    return null;

};

/**
 * load profiles index + aliases
 */

const index = getJSONFile( 'profile/_index' );
const alias = getJSONFile( 'profile/_alias' );

/**
 * export public methods
 */
module.exports = {
    index, alias,
    resolveURI,
    getJSONFile,
    getCSVFile,
    getFullProfile
};