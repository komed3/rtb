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

    return fs.existsSync( __dirname + file )
        ? JSON.parse( fs.readFileSync( __dirname + file ) )
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

    return fs.existsSync( __dirname + file )
        ? fs.readFileSync( __dirname + file )
            .toString()
            .split( newLine )
            .filter( r => r )
            .map( ( r ) => {
                return r.split( delimiter ).map( ( a ) => {
                    return a.length
                        ? !isNaN( a ) && !isNaN( parseFloat( a ) )
                            ? parseFloat( a )
                            : a
                        : null;
                } );
            } )
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
 * get profile name
 * @param {String} uri profile URI
 * @returns name
 */
const getProfileName = ( uri ) => {

    uri = resolveURI( uri );

    if( uri in index ) {

        return index[ uri ].name;

    } else {

        return null;

    }

};

/**
 * get profile image
 * @param {String} uri profile URI
 * @returns image
 */
const getProfileImage = ( uri ) => {

    uri = resolveURI( uri );

    let info = getJSONFile( '/profile/' + uri + '/info' );

    if( info ) {

        return info.image || '/res/blank-' + ( info.gender || 'm' ) + '.jpg';

    } else {

        return null;

    }

};

/**
 * get profile info by URI
 * @param {String} uri profile URI
 * @returns profile info object
 */
const getProfile = ( uri ) => {

    return getJSONFile( '/profile/' + uri + '/info' );

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
            related: getJSONFile( path + 'related' ),
            history: getCSVFile( path + 'history' ),
            assets: getJSONFile( path + 'assets' ),
            latest: getJSONFile( path + 'latest' ),
            annual: getJSONFile( path + 'annual' )
        };

    }

    return null;

};

/**
 * load profiles index + aliases
 */

const latest = fs.existsSync( __dirname + '/latest' )
    ? fs.readFileSync( __dirname + '/latest' ).toString()
    : ( new Date() ).toISOString().split( 'T' )[0];

const index = getJSONFile( '/profile/_index' );
const alias = getJSONFile( '/profile/_alias' );

const indexes = {
    industry: getJSONFile( '/stats/industry/_index' ),
    country: getJSONFile( '/stats/country/_index' )
};

/**
 * export public methods
 */
module.exports = {
    latest,
    index, alias,
    indexes,
    resolveURI,
    getJSONFile,
    getCSVFile,
    getProfileName,
    getProfileImage,
    getProfile,
    getFullProfile
};