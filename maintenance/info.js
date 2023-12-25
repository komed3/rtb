/**
 * rtb script "info"
 * update additional profile data
 */

'use strict';

const dir = __dirname + '/../api/';
const api = 'https://www.forbes.com/forbesapi/person/';
const threshold = ( new Date() ).getTime() - 15552000000;
const today = ( new Date() ).toISOString();

var maxRequest = 250;

const colors = require( 'ansi-colors' );
const axios = require( 'axios' );
const isoCountries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );
const logging = require( './_logging' );

/**
 * update profile timestamp
 * @param {String} path path to profile
 */
const updateTimestamp = ( path ) => {

    fs.writeFileSync( path + 'updated', today, { flag: 'w' } );

};

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

    logging.next(
        '[1/2] getting ready',
        1, 'steps'
    );

    if( fs.existsSync( dir + 'profile/_index' ) ) {

        let profiles = Object.keys( JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ) ),
            count = profiles.length, i = 0;

        /**
         * reset timestamps if flag is active
         */

        if( process.argv.includes( '--reset' ) ) {

            logging.addTotal( count );
            logging.update();

            profiles.forEach( ( uri ) => {

                let path = dir + 'profile/' + uri + '/updated';

                if( fs.existsSync( path ) ) {

                    fs.unlinkSync( path );

                }

                logging.update();

            } );

        } else {

            logging.update();

        }

        logging.next(
            '[2/2] update profile info',
            count, 'profiles'
        );

        /**
         * update data
         */

        profiles.forEach( ( uri ) => {

            let path = dir + 'profile/' + uri + '/';

            if( fs.existsSync( path + 'info' ) ) {

                let info = JSON.parse( fs.readFileSync( path + 'info' ) );

                if(
                    (
                        !fs.existsSync( path + 'updated' ) ||
                        ( new Date(
                            fs.readFileSync( path + 'updated' ).toString()
                        ) ).getTime() < threshold
                    ) &&
                    --maxRequest > 0
                ) {

                    /**
                     * update profile timestamp
                     */

                    updateTimestamp( path );

                    /**
                     * try to fetch data for profile
                     */

                    axios.get( api + uri ).then( ( response ) => {

                        if( response.data && response.data.person ) {

                            let data = response.data.person;

                            /**
                             * get detailed residence info
                             */

                            let country = data.countryOfResidence
                                ? isoCountries.getAlpha2Code( data.countryOfResidence, 'en' )
                                : null;

                            if( !country || country == undefined ) {

                                country = null;

                            } else {

                                country = country.toLowerCase();

                            }

                            info.residence = {
                                country: country,
                                state: data.stateProvince || null,
                                city: data.city || null
                            };

                            if( 'zip' in data ) {

                                info.residence.zipCode = data.zip;

                            }

                            /**
                             * save profile info
                             */

                            fs.writeFileSync(
                                path + 'info',
                                JSON.stringify( {
                                    ...info,
                                    ...{
                                        deceased: !!( data.deceased || false ),
                                        children: parseInt( data.numberOfChildren || 0 ),
                                        maritalStatus: data.maritalStatus || null,
                                        educations: [].concat( data.educations || [] ),
                                        organization: data.organization ? {
                                            name: data.organization,
                                            title: data.title || null
                                        } : null,
                                        selfMade: {
                                            type: data.selfMadeType || null,
                                            rank: data.selfMadeRank || null
                                        }
                                    }
                                }, null, 2 ),
                                { flag: 'w' }
                            );

                            /**
                             * save related entities
                             */

                            fs.writeFileSync(
                                path + 'related',
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

                        logging.update();

                        if( ++i == count ) {

                            logging.finish();

                        }

                    } );

                } else {

                    logging.update();

                    if( ++i == count ) {

                        logging.finish();

                    }

                }

            }

        } );

    } else {

        logging.abort();

        console.log( colors.red( 'no profiles found' ) );

        process.exit(1);

    }

};

/**
 * start info updater
 */

run();