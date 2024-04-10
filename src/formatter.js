'use strict';

/**
 * format date to MM/DD/YY
 * @param {String|Date} ts timestamp or date
 * @returns formatted date string
 */
const date = ( ts ) => {

    let date = new Date( ts );

    return ( date.getMonth() + 1 ).toString().padStart( 2, '0' ) + '/' +
           date.getDate().toString().padStart( 2, '0' ) + '/' +
           date.getFullYear().toString().substring( 2 );

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
 
    value = parseFloat( value ) * base;

    if( value == 0 ) {

        return '$0';

    }

    let sign = value < 0 ? '-' : '';

    value = Math.abs( value );

    let unit = Math.max( 0, Math.min( 3, Math.floor( Math.log10( value ) / 3 ) ) ),
        number = ( value / Math.pow( 10, unit * 3 ) ).toFixed( digits );

    return sign + '$' + ( trimZero ? parseFloat( number ) : number ) + [ '', 'K', 'M', 'B' ][ unit ];

};

/**
 * format percentage
 * @param {Float} value percent
 * @param {Int} digits number of digits
 * @param {Boolean} trimZero trim zero
 * @returns formatted percentage
 */
const percent = ( value, digits= 1, trimZero = true ) => {

    let pct = value.toFixed( digits );

    return (
        trimZero
            ? parseFloat( pct )
            : pct
    ) + '%';

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
            networth( Math.abs( change.value ), digits, base, trimZero ) +
            ( parseFloat( pct ) != 0
                ? '<pct> (' + ( trimZero ? parseFloat( pct ) : pct ) + '%)</pct>'
                : '' ) +
        '</span>';

    }

    return '$0';

};

/**
 * export public methods
 */
module.exports = {
    date,
    networth,
    percent,
    change
};