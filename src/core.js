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
 * link to tist rank
 * @param {Int} rank rank
 * @param {String} list list name
 * @returns link to list
 */
const listlink = ( rank, list = 'rtb' ) => {

    return url( '/list/' + list + '?page=' + Math.ceil( rank / 25 ) + '#_r' + rank );

};

/**
 * get query to certain page
 * @param {Object} query query object
 * @param {*} page page number
 * @returns query string
 */
const paginationLink = ( query, page ) => {

    query.page = page;

    return '?' + ( new URLSearchParams( query ) ).toString();

};

/**
 * create pagination
 * @param {Object} query query object
 * @param {Int} max count of total items
 * @param {Int} page current page
 * @param {Int} limit item limit per page
 * @returns pagination
 */
const pagination = ( query, max, page, limit ) => {

    let maxPage = Math.ceil( max / limit ),
        pagination = '',
        latest = 0;

    if( page > 1 ) {

        pagination += '<a class="rtb-pagination-link" href="' +
            paginationLink( query, page - 1 ) +
        '">« Previous</a>';

    }

    [ ...new Set( [
        1,
        Math.max( 1, page - 2 ),
        Math.max( 1, page - 1 ),
        page,
        Math.min( maxPage, page + 1 ),
        Math.min( maxPage, page + 2 ),
        maxPage
    ] ) ].forEach( ( p ) => {

        if( p > latest + 1 ) {

            pagination += '<span class="rtb-pagination-dots">…</span>';

        }

        if( p == page ) {

            pagination += '<span class="rtb-pagination-current">' + p + '</span>';

        } else {

            pagination += '<a class="rtb-pagination-link" href="' +
                paginationLink( query, p ) +
            '">' + p + '</a>';

        }

        latest = p;

    } );

    if( page < maxPage ) {

        pagination += '<a class="rtb-pagination-link" href="' +
            paginationLink( query, page + 1 ) +
        '">Next »</a>';

    }

    return pagination;

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
 * get random item from array
 * @param {Array} arr array of items
 * @returns random item
 */
const randItem = ( arr ) => {

    return arr[ Math.floor( Math.random() * arr.length ) ];

};

/**
 * export public methods
 */
module.exports = {
    parseURL,
    getCanonical,
    url,
    listlink,
    pagination,
    chartData,
    randItem
};