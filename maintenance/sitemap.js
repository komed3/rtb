/**
 * rtb script "sitemap"
 * generate sitemap
 */

'use strict';

require( 'dotenv' ).config();

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );

var sitemap = [];

/**
 * add link to sitemap (in each language)
 * @param {String} link page link
 */
const add2Sitemap = ( link ) => {

    sitemap.push( process.env.baseURL + '/' + link );

};

/**
 * generate sitemap
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'generate sitemap' ) );
    console.log( '' );

    /**
     * add global pages
     */

    add2Sitemap( '' );
    add2Sitemap( 'list/rtb' );
    add2Sitemap( 'movers' );
    add2Sitemap( 'top10' );

    /**
     * add profiles
     */

    Object.keys( api.index ).forEach( ( uri ) => {

        add2Sitemap( 'profile/' + uri );

    } );

    /**
     * add statistic pages
     */

    add2Sitemap( 'stats' );

    Object.keys( api.indexes.country ).forEach( ( uri ) => {

        add2Sitemap( 'country/' + uri );

    } );

    Object.keys( api.indexes.industry ).forEach( ( uri ) => {

        add2Sitemap( 'industry/' + uri );

    } );

    /**
     * add filter pages
     */

    let filter = api.getJSONFile( '/filter/_index' );

    Object.keys( filter._global ).forEach( ( uri ) => {

        add2Sitemap( 'filter/' + uri );

    } );

    Object.keys( filter.industry.index ).forEach( ( uri ) => {

        add2Sitemap( 'filter/industry/' + uri );

    } );

    Object.keys( filter.country.index ).forEach( ( uri ) => {

        add2Sitemap( 'filter/country/' + uri );

    } );

    /**
     * save sitemaps
     */

    fs.writeFileSync(
        __dirname + '/../sitemap.xml',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            sitemap.map( ( link ) => {
                return '<url><loc>' + link + '</loc></url>\n';
            } ).join( '' ) +
        '</urlset>',
        { flag: 'w' }
    );

    console.log( colors.green( 'DONE' ) );

};

/**
 * generate sitemap
 */
run();