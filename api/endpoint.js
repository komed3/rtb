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
 * get profile by URI
 * @param {String} uri profile URI
 * @returns profile object
 */
const getFullProfile = ( uri ) => {

    let path = __dirname + '/profile/' + uri + '/';

    if( fs.existsSync( path ) ) {

        return {
            info: getJSONFile( path + 'info' ),
            bio: getJSONFile( path + 'bio' ),
            assets: getJSONFile( path + 'assets' )
        };

    }

    return null;

};

/**
 * export public methods
 */
module.exports = {
    getJSONFile,
    getFullProfile
};