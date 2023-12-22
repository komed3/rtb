/**
 * rtb script "update"
 * update billionaires data
 */

'use strict';

const dir = __dirname + '/../api/';
const today = ( new Date() ).toISOString().split( 'T' )[0];
const api = 'https://www.forbes.com/forbesapi/person/rtb/0/position/true.json';

var bar, _time, _step = 0;

const colors = require( 'ansi-colors' );
const axios = require( 'axios' );
const cliProgress = require( 'cli-progress' );
const countries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );

function nextStep( step, total, chunks = '', start = 0 ) {

    _time = ( new Date() ).getTime();
    _step++;

    console.log( step );

    const bar = new cliProgress.SingleBar( {
        format: '{bar} | ' + colors.yellow( 'ETA: {eta}s' ) + ' | {value} of {total} ' + chunks
    }, cliProgress.Presets.rect );

    bar.start( total, start );

    return bar;

}

function finishStep() {

    bar.stop();

    console.log( colors.green( 'step ' + _step + ' finished after ' + (
        ( ( new Date() ).getTime() - _time ) / 1000
    ).toFixed( 3 ) + 's' ) );

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
        '[1/5] getting ready',
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
        '[2/5] fetching real-time data',
        1, 'files'
    );

    const response = await axios.get( api );

    bar.update(1);
    finishStep();

    let stream;

    let lists = {
        rtb: []
    };

    let stats = {
        count: 0,
        woman: 0,
        total: 0
    };

    if(
        response.data && response.data.personList &&
        response.data.personList.personsLists
    ) {

        /**
         * process profiles in list
         */

        let i = 0;

        bar = nextStep(
            '[3/5] process profiles',
            response.data.personList.personsLists.length || 0,
            'profiles'
        );

        response.data.personList.personsLists.forEach( ( profile ) => {

            let uri = profile.uri.trim(),
                ts = ( new Date( profile.timestamp ) ).toISOString().split( 'T' )[0],
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

            let image = profile.squareImage || null;

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
                    image: image,
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

            /**
             * latest (net worth) data
             */

            let networth = Number( parseFloat( profile.finalWorth || 0 ).toFixed( 3 ) );

            let latest = null,
                change = null;

            if( fs.existsSync( path + 'latest' ) ) {

                latest = JSON.parse( fs.readFileSync( path + 'latest' ) );

                if( latest.networth && networth != latest.networth ) {

                    let diff = networth - latest.networth;

                    change = {
                        value: Number( diff.toFixed( 3 ) ),
                        pct: Number( ( diff / networth * 100 ).toFixed( 3 ) ),
                        date: ts
                    };

                }

            }

            fs.writeFileSync(
                path + 'latest',
                JSON.stringify( {
                    date: ts,
                    rank: profile.rank || null,
                    networth: networth,
                    change: change,
                    private: parseFloat( profile.privateAssetsWorth || 0 ),
                    archived: parseFloat( profile.archivedWorth || 0 )
                }, null, 2 ),
                { flag: 'w' }
            );

            /**
             * append history
             */

            if( latest == null || latest.date != ts ) {

                fs.appendFileSync(
                    path + 'history',
                    [
                        ts,
                        ( profile.rank || '' ),
                        networth,
                        change ? change.value : 0,
                        change ? change.pct : 0
                    ].join( ' ' ) + '\r\n',
                    { flag: 'a' }
                );

            }

            /**
             * basic stats
             */

            stats.count++;
            stats.total += networth;

            if( gender == 'f' ) {

                stats.woman++;

            }

            /**
             * ranking(s)
             * requires net worth at least $1B
             */

            if( profile.rank && networth >= 1000 ) {

                let ranking = {};

                if( fs.existsSync( path + 'rank' ) ) {

                    ranking = JSON.parse( fs.readFileSync( path + 'rank' ) );

                }

                /**
                 * real-time list
                 */

                ranking.rtb = {
                    rank: profile.rank,
                    date: ts
                };

                lists.rtb.push( {
                    rank: profile.rank,
                    uri: uri,
                    name: name,
                    gender: gender,
                    age: birthDate
                        ? new Date(
                              new Date() - new Date( birthDate )
                          ).getFullYear() - 1970
                        : null,
                    networth: networth,
                    citizenship: country,
                    image: image,
                    industry: industries,
                    source: sources
                } );

                /**
                 * save ranking data
                 */

                fs.writeFileSync(
                    path + 'rank',
                    JSON.stringify( ranking, null, 2 ),
                    { flag: 'w' }
                );

            }

            bar.update( ++i );

        } );

        finishStep();

    }

    /**
     * process real-time list
     */

    bar = nextStep(
        '[4/5] save lists',
        3, 'steps'
    );

    stream = JSON.stringify( {
        date: today,
        count: stats.count,
        woman: stats.woman,
        total: Number( stats.total.toFixed( 3 ) ),
        list: lists.rtb
    }, null, 2 );

    fs.writeFileSync(
        dir + 'list/rtb/' + today,
        stream, { flag: 'w' }
    );

    bar.update(1);

    fs.writeFileSync(
        dir + 'list/rtb/latest',
        stream, { flag: 'w' }
    );

    bar.update(2);

    fs.appendFileSync(
        dir + 'availableDays',
        today + '\r\n',
        { flag: 'a' }
    );

    bar.update(3);
    finishStep();

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