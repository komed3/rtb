/**
 * rtb script "update"
 * update billionaires data
 */

'use strict';

const dir = __dirname + '/../api/';
const today = ( new Date() ).toISOString().split( 'T' )[0];
const api = 'https://www.forbes.com/forbesapi/person/rtb/0/position/true.json';

const colors = require( 'ansi-colors' );
const axios = require( 'axios' );
const fs = require( 'fs' );
const isoCountries = require( 'i18n-iso-countries' );
const logging = require( './_logging' );

/**
 * sanitize input
 * @param {String} str input
 * @returns sanitized string
 */
var sanitize = ( str ) => {

    return str
        .toLowerCase()
        .trim()
        .replace( /[^a-z0-9-]/g, '-' )
        .replace( /-{1,}/g, '-' );

};

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

    return name.split( ', ' )[0];

};

/**
 * calculate age from birthdate
 * @param {String|Null} date birthdate or null
 * @returns age or null
 */
var getAge = ( date ) => {

    return date ? new Date(
        new Date() - new Date( date )
    ).getFullYear() - 1970 : null;

};

/**
 * get list item URI by index
 * @param {Object} object real-time data
 * @param {Int} index item ID
 * @returns item URI
 */
var getItem = ( object, index ) => {

    if( index in object ) {

        let item = object[ index ];

        if( item.rank && parseFloat( item.finalWorth ) >= 1000 ) {

            return item.uri;

        }

    }

    return null;

};

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

    logging.next(
        '[1/8] getting ready',
        4, 'steps'
    );

    [
        'list/rtb/',
        'filter/country/',
        'filter/industry/',
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

    logging.update();

    /**
     * check update
     */

    if(
        fs.existsSync( dir + 'latest' ) &&
        fs.readFileSync( dir + 'latest' ).toString().split( 'T' )[0] == today
    ) {

        logging.abort();

        console.log( colors.red( 'real-time data already updated for ' + today ) );

        process.exit(1);

    }

    logging.update();

    /**
     * get profile index
     */

    var index = fs.existsSync( dir + '/profile/_index' )
        ? JSON.parse( fs.readFileSync( dir + '/profile/_index' ) || '{}' )
        : {};

    logging.update();

    /**
     * get aliases
     */

    var alias = fs.existsSync( dir + '/profile/_alias' )
        ? JSON.parse( fs.readFileSync( dir + '/profile/_alias' ) || '{}' )
        : {};

    logging.update();

    /**
     * fetch data
     */

    logging.next(
        '[2/8] fetching real-time data',
        1, 'files'
    );

    const response = await axios.get( api );

    logging.update();

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

        let rtb = response.data.personList.personsLists;

        /**
         * process profiles in list
         */

        logging.next(
            '[3/8] process profiles',
            rtb.length || 0,
            'profiles'
        );

        rtb.forEach( ( profile, _i ) => {

            let uri = profile.uri.trim();

            /**
             * check if profile uri exists in aliases list
             */

            if( uri in alias ) {

                uri = alias[ uri ];

            }

            let ts = ( new Date( profile.timestamp ) ).toISOString().split( 'T' )[0],
                path = dir + 'profile/' + uri + '/';

            /**
             * create folder (if not exists)
             */

            if( !fs.existsSync( path ) ) {

                fs.mkdirSync( path, { recursive: true } );

            }

            /**
             * process basic data
             */

            let name = (
                profile.person.name || profile.personName || profile.lastName ||
                uri.replace( '-', ' ' ).replace( /(^\w{1})|(\s+\w{1})/g, l => l.toUpperCase() ) || ''
            ).trim();

            let country = profile.countryOfCitizenship
                ? isoCountries.getAlpha2Code( profile.countryOfCitizenship, 'en' )
                : null;

            if( !country || country == undefined ) {

                country = null;

            } else {

                country = country.toLowerCase();

            }

            let gender = profile.gender
                ? profile.gender.toLowerCase()
                : null;

            let birthDate = profile.birthDate
                ? new Date( profile.birthDate )
                : null;

            let age = getAge( birthDate );

            let industries = [].concat( profile.industries || [] ).map(
                a => a.replaceAll( ' and ', ' & ' ).trim()
            );

            let _industries = industries.map( a => sanitize( a ) );

            let sources = ( profile.source || '' ).trim().split( ', ' ).map(
                a => a.trim()
            );

            /**
             * check if update is needed
             */

            if( !fs.existsSync( path + 'updated' ) ) {

                /**
                 * save basic profile infos
                 * only if not updated
                 */

                let info = fs.existsSync( path + 'info' )
                    ? JSON.parse( fs.readFileSync( path + 'info' ) )
                    : {};

                fs.writeFileSync(
                    path + 'info',
                    JSON.stringify( {
                        ...info,
                        ...{
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
                            industry: _industries,
                            source: sources
                        }
                    }, null, 2 ),
                    { flag: 'w' }
                );

            }

            /**
             * save bios
             */

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
             * latest (net worth) data
             */

            let networth = Number( parseFloat( profile.finalWorth || 0 ).toFixed( 3 ) );

            let rank = networth < 1000 ? null : ( profile.rank || null );

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
                    rank: rank,
                    networth: networth,
                    change: change,
                    private: parseFloat( profile.privateAssetsWorth || 0 ),
                    archived: parseFloat( profile.archivedWorth || 0 )
                }, null, 2 ),
                { flag: 'w' }
            );

            /**
             * add profile to index
             */

            index[ uri ] = {
                name: name,
                rank: rank,
                networth: networth,
                update: today
            };

            /**
             * append history
             */

            if( latest == null || latest.date != ts ) {

                fs.appendFileSync(
                    path + 'history',
                    [
                        ts,
                        rank,
                        networth,
                        change ? change.value : 0,
                        change ? change.pct : 0
                    ].join( ' ' ) + '\r\n',
                    { flag: 'a' }
                );

            }

            /**
             * ranking(s)
             * requires net worth at least $1B
             */

            if( rank && networth >= 1000 ) {

                let ranking = fs.existsSync( path + 'rank' )
                    ? JSON.parse( fs.readFileSync( path + 'rank' ) )
                    : {};

                /**
                 * real-time list
                 */

                ranking.rtb = {
                    date: ts,
                    rank: rank,
                    prev: getItem( rtb, _i - 1 ),
                    next: getItem( rtb, _i + 1 )
                };

                lists.rtb.push( {
                    rank: rank,
                    uri: uri,
                    name: name,
                    gender: gender,
                    age: age,
                    networth: networth,
                    change: change,
                    citizenship: country,
                    industry: _industries,
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

                /**
                 * basic stats
                 */

                stats.count++;
                stats.total += networth;

                if( gender == 'f' ) {

                    stats.woman++;

                }

            }

            /**
             * extended stats
             */

            let cng_pct = change != null ? change.pct : 0;

            if( rank && industries.length ) {

                industries.forEach( ( industry ) => {

                    if( !( industry in stats.industry ) ) {

                        stats.industry[ industry ] = {
                            count: 0,
                            total: 0,
                            value: 0,
                            first: {
                                profile: uri,
                                rank: rank,
                                networth: networth
                            }
                        };

                    }

                    stats.industry[ industry ].count++;

                    stats.industry[ industry ].total += networth;
                    stats.industry[ industry ].value += cng_pct;

                } );

            }

            if( rank && country ) {

                if( !( country in stats.country ) ) {

                    stats.country[ country ] = {
                        count: 0,
                        total: 0,
                        value: 0,
                        first: {
                            profile: uri,
                            rank: rank,
                            networth: networth
                        }
                    };

                }

                stats.country[ country ].count++;

                stats.country[ country ].total += networth;
                stats.country[ country ].value += cng_pct;

            }

            /**
             * daily movers
             */

            if( rank && change != null ) {

                movers.value[ uri ] = change.value;
                movers.pct[ uri ] = change.pct;

            }

            logging.update();

        } );

    }

    /**
     * process real-time list
     */

    logging.next(
        '[4/8] save lists',
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

    logging.update();

    fs.writeFileSync(
        dir + 'list/rtb/latest',
        stream, { flag: 'w' }
    );

    logging.update();

    fs.appendFileSync(
        dir + 'availableDays',
        today + '\r\n',
        { flag: 'a' }
    );

    logging.update();

    /**
     * process stats
     */

    logging.next(
        '[5/8] process stats',
        Object.keys( stats ).length,
        'files'
    );

    fs.appendFileSync(
        dir + 'stats/total',
        today + ' ' + stats.total.toFixed( 3 ) + '\r\n',
        { flag: 'a' }
    );

    logging.update();

    fs.appendFileSync(
        dir + 'stats/count',
        today + ' ' + stats.count + '\r\n',
        { flag: 'a' }
    );

    logging.update();

    fs.appendFileSync(
        dir + 'stats/woman',
        today + ' ' + stats.woman + '\r\n',
        { flag: 'a' }
    );

    logging.update();

    for( const [ key, value ] of Object.entries( stats ) ) {

        if( typeof value == 'object' ) {

            let path = dir + 'stats/' + key + '/',
                list = [];

            let idx = fs.existsSync( path + '_index' )
                ? JSON.parse( fs.readFileSync( path + '_index' ) )
                : {};

            for( const [ k, v ] of Object.entries( value ) ) {

                let _k = sanitize( k );

                idx[ _k ] = key == 'country' ? countryName( k ) : k;

                list.push( [
                    _k, v.count, v.total.toFixed( 3 ),
                    v.first.profile, v.first.rank,
                    v.first.networth
                ] );

                fs.appendFileSync(
                    path + _k,
                    today + ' ' + v.count + ' ' + v.total.toFixed( 3 ) + ' ' + (
                        v.value / v.count
                    ).toFixed( 3 ) + ' ' + v.first.profile + '\r\n',
                    { flag: 'a' }
                );

            }

            fs.writeFileSync(
                path + '_index',
                JSON.stringify( Object.keys( idx ).sort().reduce( ( a, b ) => ( {
                    ...a, [ b ]: idx[ b ]
                } ), {} ), null, 2 ),
                { flag: 'w' }
            );

            fs.writeFileSync(
                path + '_list',
                list.sort(
                    ( a, b ) => b[1] - a[1]
                ).map(
                    ( a ) => a.join( ' ' )
                ).join( '\r\n' ),
                { flag: 'w' }
            );

            logging.update();

        }

    }

    /**
     * daily movers
     */

    logging.next(
        '[6/8] daily movers',
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

            logging.update();

            fs.writeFileSync(
                dir + 'movers/' + type + '/winner/latest',
                stream, { flag: 'w' }
            );

            logging.update();

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

            logging.update();

            fs.writeFileSync(
                dir + 'movers/' + type + '/loser/latest',
                stream, { flag: 'w' }
            );

            logging.update();

        }

    }

    /**
     * create filter
     */

    logging.next(
        '[7/8] create filter',
        Object.keys( index ).length + 5,
        'steps'
    );

    let filter = {
        country: {},
        industry: {},
        young: [],
        old: [],
        woman: []
    }

    Object.keys( index ).forEach( ( uri ) => {

        let path = dir + 'profile/' + uri + '/info';

        if( fs.existsSync( path ) ) {

            let info = JSON.parse( fs.readFileSync( path ) ),
                age = getAge( info.birthDate );

            if( info.gender == 'f' ) {

                filter.woman.push( uri );

            }

            if( age < 50 ) {

                filter.young.push( uri );

            } else if( age > 80 ) {

                filter.old.push( uri );

            }

            if( info.citizenship ) {

                if( !( info.citizenship in filter.country ) ) {

                    filter.country[ info.citizenship ] = [];

                }

                filter.country[ info.citizenship ].push( uri );

            }

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

    for( const [ key, value ] of Object.entries( filter ) ) {

        if( Array.isArray( value ) ) {

            fs.writeFileSync(
                dir + 'filter/' + key,
                JSON.stringify( value.sort(), null, 2 ),
                { flag: 'w' }
            );

        } else {

            let path = dir + 'filter/' + key + '/';

            let idx = fs.existsSync( path + '_index' )
                ? JSON.parse( fs.readFileSync( path + '_index' ) )
                : {};

            for( const [ k, v ] of Object.entries( value ) ) {

                let _k = sanitize( k );

                idx[ _k ] = key == 'country' ? countryName( k ) : k;

                fs.writeFileSync(
                    path + _k,
                    JSON.stringify( v.sort(), null, 2 ),
                    { flag: 'w' }
                );

            }

            fs.writeFileSync(
                path + '_index',
                JSON.stringify( Object.keys( idx ).sort().reduce( ( a, b ) => ( {
                    ...a, [ b ]: idx[ b ]
                } ), {} ), null, 2 ),
                { flag: 'w' }
            );

        }

        logging.update();

    }

    /**
     * finishing off
     */

    logging.next(
        '[8/8] finishing off',
        3, 'steps'
    );

    /**
     * save profile index
     */

    fs.writeFileSync(
        dir + 'profile/_index',
        JSON.stringify( Object.keys( index ).sort().reduce( ( a, b ) => ( {
            ...a, [ b ]: index[ b ]
        } ), {} ), null, 2 ),
        { flag: 'w' }
    );

    logging.update();

    /**
     * update timestamp
     */

    fs.writeFileSync(
        dir + 'latest',
        today, { flag: 'w' }
    );

    logging.update();

    fs.writeFileSync(
        dir + 'updated',
        ( new Date() ).toISOString(),
        { flag: 'w' }
    );

    logging.update();
    logging.finish();

};

/**
 * start updater
 */

run();