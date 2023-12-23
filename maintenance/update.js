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
const isoCountries = require( 'i18n-iso-countries' );
const fs = require( 'fs' );

/**
 * start new step (with progress bar)
 * @param {String} step name of step
 * @param {Int} total total number of steps
 * @param {String} chunks
 * @param {Int} start start position (bar)
 * @returns bar instance
 */
var nextStep = ( step, total, chunks = '', start = 0 ) => {

    _time = ( new Date() ).getTime();
    _step++;

    console.log( step );

    const bar = new cliProgress.SingleBar( {
        format: '{bar} | ' + colors.yellow( 'ETA: {eta}s' ) + ' | {value} of {total} ' + chunks
    }, cliProgress.Presets.rect );

    bar.start( total, start );

    return bar;

}

/**
 * finish current step
 */
var finishStep = () => {

    bar.stop();

    console.log( colors.green( 'step ' + _step + ' finished after ' + (
        ( ( new Date() ).getTime() - _time ) / 1000
    ).toFixed( 3 ) + 's' ) );

    console.log( '' );

}

/**
 * get (short) country name
 * @param {String} country ISO code
 * @returns country name
 */
var countryName = ( country ) => {

    let name = isoCountries.getName( country, 'en', { select: 'alias' } );

    if( name.length < 4 ) {

        name = isoCountries.getName( country, 'en' );

    }

    return name;

}

/**
 * run update
 */
async function run() {

    console.log( 'Real-time billionaires' );
    console.log( colors.yellow( 'update data as of ' + today ) );
    console.log( '' );

    /**
     * create folders (if not exists)
     */

    bar = nextStep(
        '[1/7] getting ready',
        3, 'steps'
    );

    [
        'list/rtb/',
        'movers/pct/winner/',
        'movers/pct/loser/',
        'movers/value/winner/',
        'movers/value/loser/',
        'profile/',
        'stats/country/',
        'stats/industry/'
    ].forEach( ( d ) => {

        fs.mkdirSync( dir + d, { recursive: true } );

    } );

    bar.increment();

    /**
     * check update
     */

    if(
        fs.existsSync( dir + 'latest' ) &&
        fs.readFileSync( dir + 'latest' ).toString().split( 'T' )[0] == today
    ) {

        bar.stop();

        console.log( colors.red( 'real-time data already updated for ' + today ) );

        process.exit(1);

    }

    bar.increment();

    /**
     * get profile list
     */

    var list = fs.existsSync( dir + '/profile/list' )
        ? JSON.parse( fs.readFileSync( dir + '/profile/list' ) || '{}' )
        : {};

    bar.increment();
    finishStep();

    /**
     * fetch data
     */

    bar = nextStep(
        '[2/7] fetching real-time data',
        1, 'files'
    );

    const response = await axios.get( api );

    bar.increment();
    finishStep();

    let stream;

    let lists = {
        rtb: []
    };

    let stats = {
        industry: {},
        country: {},
        count: 0,
        woman: 0,
        total: 0
    };

    let movers = {
        value: {},
        pct: {}
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
            '[3/7] process profiles',
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
                ? isoCountries.getAlpha2Code( profile.countryOfCitizenship, 'en' )
                : null;

            let gender = profile.gender
                ? profile.gender.toLowerCase()
                : null;

            let birthDate = profile.birthDate
                ? new Date( profile.birthDate )
                : null;

            let image = profile.squareImage || null;

            let industries = [].concat( profile.industries || [] ).map(
                a => a.replaceAll( ' and ', ' & ' ).trim()
            );

            let sources = ( profile.source || '' ).trim().split( ', ' ).map(
                a => a.trim()
            );

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

            /**
             * extended stats
             */

            let cng_pct = change != null ? change.pct : 0;

            if( industries && industries.length ) {

                industries.forEach( ( industry ) => {

                    if( !( industry in stats.industry ) ) {

                        stats.industry[ industry ] = {
                            count: 0,
                            total: 0,
                            value: 0
                        };

                    }

                    stats.industry[ industry ].count++;

                    stats.industry[ industry ].total += networth;
                    stats.industry[ industry ].value += cng_pct;

                } );

            }

            if( country ) {

                if( !( country in stats.country ) ) {

                    stats.country[ country ] = {
                        count: 0,
                        total: 0,
                        value: 0
                    };

                }

                stats.country[ country ].count++;

                stats.country[ country ].total += networth;
                stats.country[ country ].value += cng_pct;

            }

            /**
             * daily movers
             */

            if( change != null ) {

                movers.value[ uri ] = change.value;
                movers.pct[ uri ] = change.pct;

            }

            bar.update( ++i );

        } );

        finishStep();

    }

    /**
     * process real-time list
     */

    bar = nextStep(
        '[4/7] save lists',
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

    bar.increment();

    fs.writeFileSync(
        dir + 'list/rtb/latest',
        stream, { flag: 'w' }
    );

    bar.increment();

    fs.appendFileSync(
        dir + 'availableDays',
        today + '\r\n',
        { flag: 'a' }
    );

    bar.increment();
    finishStep();

    /**
     * process stats
     */

    bar = nextStep(
        '[5/7] process stats',
        Object.keys( stats ).length,
        'files'
    );

    fs.appendFileSync(
        dir + 'stats/total',
        today + ' ' + stats.total.toFixed( 3 ) + '\r\n',
        { flag: 'a' }
    );

    bar.increment();

    fs.appendFileSync(
        dir + 'stats/count',
        today + ' ' + stats.count + '\r\n',
        { flag: 'a' }
    );

    bar.increment();

    fs.appendFileSync(
        dir + 'stats/woman',
        today + ' ' + stats.woman + '\r\n',
        { flag: 'a' }
    );

    bar.increment();

    for( const [ key, value ] of Object.entries( stats ) ) {

        if( typeof value == 'object' ) {

            let path = dir + 'stats/' + key + '/',
                l = {};

            if( fs.existsSync( path + 'list' ) ) {

                l = JSON.parse( fs.readFileSync( path + 'list' ) );

            }

            for( const [ k, v ] of Object.entries( value ) ) {

                let _k = k.toLowerCase()
                    .replace( /[^a-z0-9-]/g, '-' )
                    .replace( /-{1,}/g, '-' )
                    .trim();

                l[ _k ] = key == 'country' ? countryName( k ) : k;

                fs.appendFileSync(
                    path + _k,
                    today + ' ' + v.count + ' ' + v.total.toFixed( 3 ) + ' ' + (
                        v.value / v.count
                    ).toFixed( 3 ) + '\r\n',
                    { flag: 'a' }
                );

            }

            fs.writeFileSync(
                path + 'list',
                JSON.stringify( l, null, 2 ),
                { flag: 'w' }
            );

            bar.increment();

        }

    }

    finishStep();

    /**
     * daily movers
     */

    bar = nextStep(
        '[6/7] daily movers',
        4, 'steps'
    );

    for( const [ type, entries ] of Object.entries( movers ) ) {

        if( Object.keys( entries ).length ) {

            /**
             * winners
             */

            stream = JSON.stringify(
                Object.entries( entries ).filter(
                    ( [ ,a ] ) => a > 0
                ).sort(
                    ( [ ,a ], [ ,b ] ) => b - a
                ).slice( 0, 10 ),
                null, 2
            );

            fs.writeFileSync(
                dir + 'movers/' + type + '/winner/' + today,
                stream, { flag: 'w' }
            );

            bar.increment();

            fs.writeFileSync(
                dir + 'movers/' + type + '/winner/latest',
                stream, { flag: 'w' }
            );

            bar.increment();

            /**
             * losers
             */

            stream = JSON.stringify(
                Object.entries( entries ).filter(
                    ( [ ,a ] ) => a < 0
                ).sort(
                    ( [ ,a ], [ ,b ] ) => a - b
                ).slice( 0, 10 ),
                null, 2
            );

            fs.writeFileSync(
                dir + 'movers/' + type + '/loser/' + today,
                stream, { flag: 'w' }
            );

            bar.increment();

            fs.writeFileSync(
                dir + 'movers/' + type + '/loser/latest',
                stream, { flag: 'w' }
            );

            bar.increment();

        }

    }

    finishStep();

    /**
     * finishing off
     */

    bar = nextStep(
        '[7/7] finishing off',
        3, 'steps'
    );

    /**
     * save profile list
     */

    fs.writeFileSync(
        dir + 'profile/list',
        JSON.stringify( list, null, 2 ),
        { flag: 'w' }
    );

    bar.increment();

    /**
     * update timestamp
     */

    fs.writeFileSync(
        dir + 'latest',
        today, { flag: 'w' }
    );

    bar.increment();

    fs.writeFileSync(
        dir + 'updated',
        ( new Date() ).toISOString(),
        { flag: 'w' }
    );

    bar.increment();
    finishStep();

}

/**
 * start updater
 */

run();