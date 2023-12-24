/**
 * rtb script "info"
 * update additional profile data
 */

'use strict';

const dir = __dirname + '/../api/';
const api = 'https://www.forbes.com/forbesapi/person/';

var incremental = process.argv.includes( '--incremental' );
var maxRequest = 500;

const colors = require( 'ansi-colors' );
const axios = require( 'axios' );
const isoCountries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );
const logging = require( './_logging' );

/**
 * run info updater
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'update profile info' ) );
    console.log( '' );

    /**
     * load profile index
     */

    logging.nextStep(
        '[1/2] getting ready',
        1, 'steps'
    );

    if( fs.existsSync( dir + 'profile/_index' ) ) {

        let profiles = Object.keys( JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ) ),
            count = profiles.length, i = 0;

        logging.updateStep();

        logging.nextStep(
            '[2/2] update profile info',
            count, 'profiles'
        );

        /**
         * update data
         */

        profiles.forEach( ( uri ) => {

            let path = dir + 'profile/' + uri + '/info';

            if( fs.existsSync( path ) ) {

                let info = JSON.parse( fs.readFileSync( path ) );

                if(
                    !( incremental && 'children' in info ) &&
                    --maxRequest > 0
                ) {

                    axios.get( api + uri ).then( ( response ) => {

                        if( response.data && response.data.person ) {

                            let data = response.data.person;

                            let country = data.countryOfResidence
                                ? isoCountries.getAlpha2Code( data.countryOfResidence, 'en' )
                                : null;

                            if( !country || country == undefined ) {

                                country = null;

                            } else {

                                country = country.toLowerCase();

                            }

                            info.residence.country = country;

                            /**
                             * save profile info
                             */

                            fs.writeFileSync(
                                path,
                                JSON.stringify( {
                                    ...info,
                                    ...{
                                        deceased: !!( data.deceased || false ),
                                        children: parseInt( data.numberOfChildren || 0 ),
                                        educations: [].concat( data.educations || [] ),
                                        organization: data.organization ? {
                                            name: data.organization,
                                            title: data.title || null
                                        } : null
                                    }
                                }, null, 2 ),
                                { flag: 'w' }
                            );

                            /**
                             * save related entities
                             */

                            fs.writeFileSync(
                                dir + 'profile/' + uri + '/related',
                                JSON.stringify(
                                    [].concat( data.relatedEntities || [] )
                                        .filter( ( r ) => {

                                            return r.type == 'person' &&
                                                profiles.includes( r.uri );

                                        } )
                                        .map( ( r ) => {

                                            return {
                                                uri: r.uri,
                                                name: r.name,
                                                type: r.relationshipType
                                            };

                                        } ),
                                    null, 2
                                ),
                                { flag: 'w' }
                            );

                        }

                        logging.updateStep();

                        if( ++i == count ) {

                            logging.finishStep();

                        }

                    } );

                } else {

                    logging.updateStep();

                    if( ++i == count ) {

                        logging.finishStep();

                    }

                }

            }

        } );

    } else {

        logging.bar.stop();

        console.log( colors.red( 'no profiles found' ) );

        process.exit(1);

    }

};

/**
 * start info updater
 */

run();