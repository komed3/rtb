/**
 * rtb script "sitemap"
 * generate sitemap
 */

'use strict';

require( 'dotenv' ).config();

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const fs = require( 'fs' );
const logging = require( './_logging' );

var sitemap = [];

/**
 * add link to sitemap (in each language)
 * @param {String} link page link
 */
const add2Sitemap = ( link ) => {

    sitemap.push( process.env.baseURL + '/' + link );

    logging.update();

};

/**
 * generate sitemap
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'generate sitemap' ) );
    console.log( '' );

    logging.next(
        'Add pages to sitemap',
        5, 'pages'
    );

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

    /**
     * add statistic pages
     */

    /**
     * add filter pages
     */

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

    logging.finish();

};

/**
 * generate sitemap
 */
run();