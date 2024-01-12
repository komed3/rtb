/**
 * rtb script "top10"
 * create top 10 billionaires list
 */

'use strict';

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );

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
     * loop trought months
     */

    console.log( 'Loop trought months ...' );

    let date = new Date( api.days[0] ),
        end = new Date( api.days[ api.days.length - 1 ] );

    while( date < end ) {

        /**
         * get last available day of month
         */

        let latest = new Date( date.getFullYear(), date.getMonth() + 1, 0 ),
            month = latest.toISOString().substring( 0, 7 ),
            day = api.nearestDate( latest ), list = [];

        date = new Date( latest.setDate( latest.getDate() + 1 ) );

        console.log( '... ' + month + ' (' + day + ')' );

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
         * add month to top 10 list
         */

        top10[ month ] = list;

    }

    console.log( colors.green( 'DONE' ) );
    console.log( '' );

    /**
     * save top 10 list
     */

    console.log( 'Prepare profiles ...' );

    for( const [ uri, name ] of Object.entries( profiles ) ) {

        let info = api.getJSONFile( '/profile/' + uri + '/info' );

        profiles[ uri ] = {
            name: name,
            image: info.image || null
        };

    }

    console.log( colors.green( 'DONE' ) );

    api.saveJSONFile( '/stats/top10', {
        profiles: profiles,
        list: top10
    } );

};

/**
 * create top 10 list
 */
run();