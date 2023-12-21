/**
 * rtb script "update"
 * update billionaires data
 */

'use strict';

const dir = __dirname + '/api/';
const today = ( new Date() ).toISOString().split( 'T' )[0];
const api = 'https://www.forbes.com/forbesapi/person/rtb/0/position/true.json';

const axios = require( 'axios' );
const fs = require( 'fs' );

async function run() {

    const response = await axios.get( api );

    if(
        response.data && response.data.personList &&
        response.data.personList.personsLists
    ) {

        //

    }

}

run();