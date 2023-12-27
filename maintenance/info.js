/**
 * rtb script "info"
 * update additional profile data
 */

'use strict';

const dir = __dirname + '/../api/';
const api = 'https://www.forbes.com/forbesapi/person/';
const threshold = ( new Date() ).getTime() - 31557600000;
const today = ( new Date() ).toISOString();

var requestLimit = process.argv.includes( '--limit' )
    ? parseInt( process.argv[ process.argv.indexOf( '--limit' ) + 1 ] || 100 )
    : 100;

const colors = require( 'ansi-colors' );
const axios = require( 'axios' );
const isoCountries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );

/**
 * run info updater
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'update profile info' ) );

    if( fs.existsSync( dir + 'profile/_index' ) ) {

        /**
         * load profile index
         */

        let profiles = Object.keys( JSON.parse( fs.readFileSync( dir + 'profile/_index' ) ) ),
            count = profiles.length;

        /**
         * reset timestamps if flag "--reset" is active
         */

        if( process.argv.includes( '--reset' ) ) {

            console.log( '' );
            console.log( 'Reset timestamps [' + colors.yellow( '--reset' ) + '] ...' );

            profiles.forEach( ( uri ) => {

                let path = dir + 'profile/' + uri + '/updated';

                if( fs.existsSync( path ) ) {

                    fs.unlinkSync( path );

                }

            } );

            console.log( '... ' + colors.green( 'DONE' ) );

        }

        console.log( '' );
        console.log( 'Update profiles ...' );

        /**
         * update data
         */

        profiles.forEach( ( uri ) => {

            let path = dir + 'profile/' + uri + '/';

            /**
             * check if update is needed
             */

            if(
                (
                    !fs.existsSync( path + 'updated' ) ||
                    ( new Date(
                        fs.readFileSync( path + 'updated' ).toString()
                    ) ).getTime() < threshold
                ) &&
                --requestLimit >= 0
            ) {

                console.log( '>> updating ' + colors.yellow( uri ) + ' ...' );

                let info = fs.existsSync( path + 'info' )
                    ? JSON.parse( fs.readFileSync( path + 'info' ) )
                    : {};

                let request = 'originalURI' in info
                    ? info.originalURI
                    : uri;

                /**
                 * update profile timestamp
                 */

                fs.writeFileSync( path + 'updated', today, { flag: 'w' } );

                /**
                 * try to fetch data for profile
                 */

                axios.get( api + request ).then( ( response ) => {

                    if( response.data && 'person' in response.data ) {

                        let person = response.data.person;

                        /**
                         * get detailed residence info
                         */

                        let country = person.countryOfResidence
                            ? isoCountries.getAlpha2Code( person.countryOfResidence, 'en' )
                            : null;

                        if( !country || country == undefined ) {

                            country = null;

                        } else {

                            country = country.toLowerCase();

                        }

                        info.residence = {
                            country: country,
                            state: person.stateProvince || null,
                            city: person.city || null
                        };

                        if( 'zip' in person ) {

                            info.residence.zipCode = person.zip;

                        }

                        if( 'geoLocation' in person ) {

                            info.residence._geo = person.geoLocation;

                        }

                        /**
                         * save profile info
                         */

                        fs.writeFileSync(
                            path + 'info',
                            JSON.stringify( {
                                ...info,
                                ...{
                                    deceased: !!( person.deceased || false ),
                                    children: parseInt( person.numberOfChildren || 0 ),
                                    maritalStatus: person.maritalStatus || null,
                                    education: [].concat( person.educations || [] ),
                                    organization: person.organization ? {
                                        name: person.organization,
                                        title: person.title || null
                                    } : null,
                                    selfMade: {
                                        _is: !!( person.selfMade || false ),
                                        type: person.selfMadeType || null,
                                        rank: person.selfMadeRank || null
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
                                [].concat( person.relatedEntities || [] )
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

                        /**
                         * save image (if exists)
                         */

                        if( 'squareImage' in person ) {

                            axios.get( person.squareImage, { responseType: 'arraybuffer' } ).then( ( image ) => {

                                let fileType = person.squareImage.split( '?' )[0].split( '.' ).reverse()[0];

                                fs.writeFile( path + 'image.' + fileType, image.data, () => {} );

                            } ).catch( () => {} );

                        }

                        console.log( '... ' + colors.green( 'DONE' ) );

                    } else {

                        console.log( '... ' + colors.red( 'ERR: data not available' ) );

                    }

                } ).catch( () => {

                    console.log( '... ' + colors.red( 'ERR: request failed' ) );

                } );

            }

        } );

    } else {

        console.log( colors.red( 'ERR: no profiles found' ) );

    }

};

/**
 * start info updater
 */

run();