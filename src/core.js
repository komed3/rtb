'use strict';

/**
 * parse url
 * @param {String} url url to parse
 * @returns parsed url
 */
const parseURL = ( url ) => {

    let parts = url.split( '/' ).filter( p => p );

    return {
        parts: parts,
        normalized: parts.map( p => p.toLowerCase() ),
        string: '/' + parts.join( '/' )
    };

};

/**
 * gets the canonical url
 * @param {String} url target url
 * @param {Boolean} split remove query args
 * @returns canonical url
 */
const getCanonical = ( url, split = true ) => {

    return ( '/' + (
        split ? url.split( '?' )[0] : url
    ) + '/' )
        .replace( /\/+/g, '/' )
        .replace( /\/+$/, '' );

};

/**
 * get canonical url with locale
 * @param {String} url path to page
 * @returns localized url
 */
const url = ( url ) => {

    return getCanonical( url, false );

};

/**
 * format chart data for html output
 * @param {Object|Array} data chart data
 * @returns base64 stringified data
 */
const chartData = ( data ) => {

    return Buffer.from( JSON.stringify( data ) ).toString( 'base64' );

}

/**
 * export public methods
 */
module.exports = {
    parseURL,
    getCanonical,
    url,
    chartData
};