/**
 * rtb script "top10"
 * create top 10 billionaires list
 */

'use strict';

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const logging = require( './_logging' );

/**
 * create top 10 billionaires list over time
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'create top 10 list' ) );
    console.log( '' );

    let profiles = {},
        top10 = {};

    /**
     * loop trought days
     */

    logging.next(
        'Loop trought days',
        api.days.length + 1,
        'days'
    );

    api.days.forEach( ( day ) => {

        let list = [];

        /**
         * get real-time list
         */

        let res = api.getList( 'rtb', { date: day } );

        /**
         * save first 10 rows
         */

        res.list.slice( 0, 10 ).forEach( ( row ) => {

            profiles[ row.uri ] = row.name;

            list.push( {
                rank: row.rank,
                uri: row.uri,
                networth: row.networth
            } );

        } );

        /**
         * add day to top 10 list
         */

        top10[ day ] = list;

        logging.update();

    } );

    /**
     * save top 10 list
     */

    api.saveJSONFile( '/stats/top10', {
        profiles: profiles,
        list: top10
    } );

    logging.finish();

};

/**
 * create top 10 list
 */
run();