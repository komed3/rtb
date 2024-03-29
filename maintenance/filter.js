/**
 * rtb script "filter"
 * create / renew filter
 */

'use strict';

const api = require( './../api/endpoint' );
const colors = require( 'ansi-colors' );
const core = require( './../src/core' );
const logging = require( './_logging' );

const profiles = Object.keys( api.index );

/**
 * create / renew filter
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'create / renew filter' ) );
    console.log( '' );

    /**
     * create filter
     */

    let filter = {
        country: {},
        industry: {},
        young: [],
        old: [],
        woman: [],
        selfMade: [],
        dropped: [],
        deceased: []
    }

    let indexes = {};

    logging.next(
        '[1/2] process profiles',
        profiles.length,
        'profiles'
    );

    profiles.forEach( ( uri ) => {

        let path = '/profile/' + uri + '/',
            info = api.getJSONFile( path + 'info' );

        if( info && Object.keys( info ).length ) {

            /**
             * filter: woman
             */

            if( info.gender == 'f' ) {

                filter.woman.push( uri );

            }

            /**
             * filter: deceased
             */

            if( info.deceased ) {

                filter.deceased.push( uri );

            } else {

                /**
                 * filter: young / old
                 */

                let age = core.date2age( info.birthDate );

                if( age != null && age < 50 ) {

                    filter.young.push( uri );

                } else if( age != null && age > 80 ) {

                    filter.old.push( uri );

                }

                /**
                 * dropped off
                 */

                let networth = api.getJSONFile( path + 'latest' ).networth || null;

                if( !isNaN( networth ) && networth < 1000 ) {

                    filter.dropped.push( uri );

                }

            }

            /**
             * filter: self-made
             */

            if( info.selfMade && info.selfMade._is ) {

                filter.selfMade.push( uri );

            }

            /**
             * filter: country (citizenship)
             */

            if( info.citizenship ) {

                if( !( info.citizenship in filter.country ) ) {

                    filter.country[ info.citizenship ] = [];

                }

                filter.country[ info.citizenship ].push( uri );

            }

            /**
             * filter: industry
             */

            info.industry.forEach( ( industry ) => {

                if( !( industry in filter.industry ) ) {

                    filter.industry[ industry ] = [];

                }

                filter.industry[ industry ].push( uri );

            } );

        }

        logging.update();

    } );

    /**
     * process (and save) filter
     */

    logging.next(
        '[2/2] process filter',
        Object.keys( filter ).length + 1,
        'filter'
    );

    for( const [ key, value ] of Object.entries( filter ) ) {

        if( Array.isArray( value ) ) {

            /**
             * save simple filter list
             */

            api.saveJSONFile(
                '/filter/' + key,
                value.sort()
            );

        } else {

            /**
             * proceed filter object
             */

            let path = '/filter/' + key + '/',
                index = api.getJSONFile( path + '_index' );

            for( const [ k, v ] of Object.entries( value ) ) {

                let _k = core.sanitize( k );

                index[ _k ] = key == 'country'
                    ? core.countryName( k )
                    : key in api.indexes
                        ? api.indexes[ key ][ k ] || k
                        : k;

                api.saveJSONFile( path + _k, v.sort() );

            }

            indexes[ key ] = Object.keys( index ).sort().reduce( ( a, b ) => ( {
                ...a, [ b ]: index[ b ]
            } ), {} );

            api.saveJSONFile(
                path + '_index',
                indexes[ key ]
            );

        }

        logging.update();

    }

    /**
     * save global filter index
     */

    api.saveJSONFile(
        '/filter/_index',
        {
            _global: {
                woman: 'Female billionaires',
                young: 'Young billionaires',
                old: 'Old billionaires',
                selfMade: 'Self-made billionaires',
                dropped: 'Dropped off billionaires',
                deceased: 'Deceased billionaires'
            },
            industry: {
                label: 'Industries',
                index: indexes.industry
            },
            country: {
                label: 'Countries',
                index: indexes.country
            }
        }
    );

    logging.finish();

};

/**
 * create / renew filter
 */
run();