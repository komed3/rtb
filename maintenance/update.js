/**
 * rtb script "update"
 * update billionaires data
 */

'use strict';

const dir = __dirname + '/../api/';
const today = ( new Date() ).toISOString().split( 'T' )[0];
const api = 'https://www.forbes.com/forbesapi/person/rtb/0/position/true.json';

const axios = require( 'axios' );
const countries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );

async function run() {

    /**
     * create folders (if not exists)
     */

    [
        'list/rtb/',
        'profile/'
    ].forEach( ( d ) => {

        fs.mkdirSync( dir + d, { recursive: true } );

    } );

    /**
     * check update
     */

    if(
        fs.existsSync( dir + 'latest' ) &&
        fs.readFileSync( dir + 'latest' ).toString().split( 'T' )[0] == today
    ) {

        process.exit(1);

    }

    /**
     * fetch data
     */

    const response = await axios.get( api );

    if(
        response.data && response.data.personList &&
        response.data.personList.personsLists
    ) {

        /**
         * process profiles in list
         */

        Array.from( response.data.personList.personsLists ).forEach( ( profile ) => {

            let uri = profile.uri,
                path = dir + 'profile/' + uri + '/';

            /**
             * create folder (if not exists)
             */

            if( !fs.existsSync( path ) ) {

                fs.mkdirSync( path, { recursive: true } );

            }

            let country = profile.countryOfCitizenship
                ? countries.getAlpha2Code( profile.countryOfCitizenship, 'en' )
                : null;

            let birthDate = profile.birthDate
                ? new Date( profile.birthDate )
                : null;

        } );

    }

}

run();