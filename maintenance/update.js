/**
 * rtb script "update"
 * update billionaires data
 */

'use strict';

const dir = __dirname + '/../api/';
const today = ( new Date() ).toISOString().split( 'T' )[0];
const api = 'https://www.forbes.com/forbesapi/person/rtb/0/position/true.json';

var bar, _step = 0;

const colors = require( 'ansi-colors' );
const axios = require( 'axios' );
const cliProgress = require( 'cli-progress' );
const countries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );

function nextStep( step, total, chunks = '', start = 0 ) {

    console.time( ++_step );
    console.log( step );

    const bar = new cliProgress.SingleBar( {
        format: ' {bar} | ' + colors.green( 'ETA: {eta}s' ) + ' | {value} of {total} ' + chunks
    }, cliProgress.Presets.rect );

    bar.start( total, start );

    return bar;

}

function finishStep() {

    bar.stop();

    console.log( colors.green( 'step ' + _step + ' finished' ) );
    console.timeEnd( _step );
    console.log( '' );

}

async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'update data as of ' + today ) );
    console.log( '' );

    /**
     * create folders (if not exists)
     */

    bar = nextStep(
        '[1/5] Getting ready',
        3, 'steps'
    );

    [
        'list/rtb/',
        'profile/'
    ].forEach( ( d ) => {

        fs.mkdirSync( dir + d, { recursive: true } );

    } );

    bar.update(1);

    /**
     * check update
     */

    if(
        fs.existsSync( dir + 'latest' ) &&
        fs.readFileSync( dir + 'latest' ).toString().split( 'T' )[0] == today
    ) {

        bar.stop();
        process.exit(1);

    }

    bar.update(2);

    /**
     * get profile list
     */

    var list = fs.existsSync( dir + '/profile/list' )
        ? JSON.parse( fs.readFileSync( dir + '/profile/list' ) || '{}' )
        : {};

    bar.update(3);
    finishStep();

    /**
     * fetch data
     */

    bar = nextStep(
        '[2/5] Fetching real-time data',
        1, 'files'
    );

    const response = await axios.get( api );

    bar.update(1);
    finishStep();

    if(
        response.data && response.data.personList &&
        response.data.personList.personsLists
    ) {

        /**
         * process profiles in list
         */

        let i = 0;

        bar = nextStep(
            '[3/5] Process profiles',
            response.data.personList.personsLists.length || 0,
            'profiles'
        );

        response.data.personList.personsLists.forEach( ( profile ) => {

            let uri = profile.uri.trim(),
                path = dir + 'profile/' + uri + '/';

            /**
             * create folder (if not exists)
             */

            if( !fs.existsSync( path ) ) {

                fs.mkdirSync( path, { recursive: true } );

            }

            let files = fs.readdirSync( path );

            /**
             * process basic data
             */

            let name = ( profile.person.name || profile.personName ).trim();

            let country = profile.countryOfCitizenship
                ? countries.getAlpha2Code( profile.countryOfCitizenship, 'en' )
                : null;

            let gender = profile.gender
                ? profile.gender.toLowerCase()
                : null;

            let birthDate = profile.birthDate
                ? new Date( profile.birthDate )
                : null;

            let industries = [].concat( profile.industries || [] ).map( a => a.trim() );

            let sources = ( profile.source || '' ).trim().split( ', ' ).map( a => a.trim() );

            /**
             * save basic profile infos
             */

            fs.writeFileSync(
                path + 'info',
                JSON.stringify( {
                    uri: uri,
                    name: name,
                    birthDate: birthDate
                        ? birthDate.toISOString().split( 'T' )[0]
                        : null,
                    family: !!( profile.family || false ),
                    gender: gender,
                    citizenship: country,
                    residence: {
                        city: profile.city || null,
                        state: profile.state || null
                    },
                    image: profile.squareImage || null,
                    industry: industries,
                    source: sources
                }, null, 2 ),
                { flag: 'w' }
            );

            fs.writeFileSync(
                path + 'bio',
                JSON.stringify( {
                    bio: [].concat( profile.bios || [] ).map( a => a.trim() ),
                    about: [].concat( profile.abouts || [] ).map( a => a.trim() )
                }, null, 2 ),
                { flag: 'w' }
            );

            /**
             * financial assets
             */

            fs.writeFileSync(
                path + 'assets',
                JSON.stringify( [].concat( profile.financialAssets || [] ), null, 2 ),
                { flag: 'w' }
            );

            /**
             * add profile to list
             */

            list[ uri ] = {
                name: name,
                country: country,
                update: today
            };

            bar.update( ++i );

        } );

        finishStep();

    }

    /**
     * save profile list
     */

    fs.writeFileSync(
        dir + 'profile/list',
        JSON.stringify( list, null, 2 ),
        { flag: 'w' }
    )

}

run();