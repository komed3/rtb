'use strict';

/**
 * format date to YYYY/MM/DD
 * @param {String|Date} ts timestamp or date
 * @returns formatted date string
 */
const date = ( ts ) => {

    return ( new Date( ts ) ).toISOString().split( 'T' )[0].replaceAll( '-', '/' );

};

/**
 * format net worth
 * @param {Float} value networth
 * @param {Int} digits number of digits
 * @param {Float} base factor
 * @returns formatted net worth string
 */
const networth = ( value, digits = 1, base = 1e6 ) => {

    value = parseFloat( value ) * base;

    if( value == 0 ) {

        return '$0';

    }

    let unit = Math.max( 0, Math.min( 3, Math.floor( Math.log10( value ) / 3 ) ) );

    return '$' + ( value / Math.pow( 10, unit * 3 ) ).toFixed( digits ) + [ '', 'K', 'M', 'B' ][ unit ];

};

/**
 * export public methods
 */
module.exports = {
    date, networth
};