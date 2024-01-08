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
        deceased: [],
        selfMade: []
    }

    logging.next(
        '[1/2] process profiles',
        profiles.length,
        'profiles'
    );

    profiles.forEach( ( uri ) => {

        let info = api.getJSONFile( '/profile/' + uri + '/info' );

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

                if( age < 50 ) {

                    filter.young.push( uri );

                } else if( age > 80 ) {

                    filter.old.push( uri );

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
        Object.keys( filter ).length,
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

                index[ _k ] = key == 'country' ? core.countryName( k ) : k;

                api.saveJSONFile( path + _k, v.sort() );

            }

            api.saveJSONFile(
                path + '_index',
                Object.keys( index ).sort().reduce( ( a, b ) => ( {
                    ...a, [ b ]: index[ b ]
                } ), {} )
            );

        }

        logging.update();

    }

    logging.finish();

};

/**
 * create / renew filter
 */
run();