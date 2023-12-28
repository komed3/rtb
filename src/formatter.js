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
 * @param {Boolean} trimZero trim zero
 * @returns formatted net worth string
 */
const networth = ( value, digits = 1, base = 1e6, trimZero = true ) => {

    value = Math.abs( parseFloat( value ) * base );

    if( value == 0 ) {

        return '$0';

    }

    let unit = Math.max( 0, Math.min( 3, Math.floor( Math.log10( value ) / 3 ) ) ),
        number = ( value / Math.pow( 10, unit * 3 ) ).toFixed( digits );

    return '$' + ( trimZero ? parseFloat( number ) : number ) + [ '', 'K', 'M', 'B' ][ unit ];

};

/**
 * format net worth change
 * @param {Object|Null} change change object
 * @param {Int} digits number of digits
 * @param {Float} base factor
 * @param {Boolean} trimZero trim zero
 * @returns formatted net worth change string
 */
const change = ( change, digits = 1, base = 1e6, trimZero = true ) => {

    if( typeof change == 'object' && change ) {

        let dir = change.value > 0,
            pct = change.pct.toFixed( digits );

        return '<span class="' + ( dir ? 'up' : 'down' ) + '">' +
            networth( change.value, digits, base, trimZero ) + ' (' +
            ( trimZero ? parseFloat( pct ) : pct ) + '%)' +
        '</span>';

    }

    return '$0';

};

/**
 * export public methods
 */
module.exports = {
    date, networth, change
};