/**
 * rtb // api endpoint
 */

'use strict';

const os = require( 'node:os' );
const fs = require( 'fs' );

/**
 * get JSON content from file
 * @param {String} file path to file
 * @returns JSON content
 */
const getJSONFile = ( file ) => {

    return fs.existsSync( __dirname + file )
        ? JSON.parse( fs.readFileSync( __dirname + file ) )
        : {};

};

/**
 * save JSON content into file
 * @param {String} file path to file
 * @param {Mixed} content file content
 */
const saveJSONFile = ( file, content ) => {

    fs.writeFileSync(
        __dirname + file,
        JSON.stringify( content, null, 2 ),
        { flag: 'w' }
    );

};

/**
 * get CSV content from file
 * @param {String} file path to file
 * @param {Int|Null} flatten get only one column
 * @param {String} delimiter value delimiter
 * @returns CSV content
 */
const getCSVFile = ( file, flatten = null, delimiter = ' ' ) => {

    let res = fs.existsSync( __dirname + file )
        ? fs.readFileSync( __dirname + file )
            .toString()
            .split( os.EOL )
            .filter( r => r )
            .map( ( r ) => {
                return r.split( delimiter ).map( ( a ) => {
                    return a.length
                        ? !isNaN( a ) && !isNaN( parseFloat( a ) )
                            ? parseFloat( a )
                            : a
                        : null;
                } );
            } )
        : [];

    if( flatten != null ) {

        res = res.map( r => r[ flatten ] || null );

    }

    return res;

};

/**
 * save CSV content into file
 * @param {String} file path to file
 * @param {Array} content file content
 * @param {String} delimiter value delimiter
 */
const saveCSVFile = ( file, content, delimiter = ' ' ) => {

    fs.writeFileSync(
        __dirname + file,
        content.map( r => r.join( delimiter ) ).join( os.EOL ) + os.EOL,
        { flag: 'w' }
    );

};

/**
 * resolve URI
 * @param {String|Null} uri request URI
 * @returns resolved URI
 */
const resolveURI = ( uri ) => {

    if( !uri || uri == null ) {

        return null;

    }

    let i = 20;

    while( !( uri in index ) && --i > 0 ) {

        if( uri in alias ) {

            uri = alias[ uri ];

        } else {

            return null;

        }

    }

    return uri;

};

/**
 * get profile name
 * @param {String} uri profile URI
 * @param {Boolean} shorten shorten name
 * @returns name
 */
const getProfileName = ( uri, shorten = false ) => {

    uri = resolveURI( uri );

    if( uri in index ) {

        return index[ uri ].name
            .toString()
            .replace( shorten ? '& family' : '', '' )
            .trim();

    } else {

        return null;

    }

};

/**
 * get profile image
 * @param {String} uri profile URI
 * @returns image
 */
const getProfileImage = ( uri ) => {

    uri = resolveURI( uri );

    let info = getJSONFile( '/profile/' + uri + '/info' );

    if( info ) {

        return info.image || '/res/blank-' + ( info.gender || 'm' ) + '.jpg';

    } else {

        return null;

    }

};

/**
 * get profile info by URI
 * @param {String} uri profile URI
 * @returns profile info object
 */
const getProfile = ( uri ) => {

    return getJSONFile( '/profile/' + uri + '/info' );

};

/**
 * get profile by URI
 * @param {String} uri profile URI
 * @returns profile object
 */
const getFullProfile = ( uri ) => {

    let path = '/profile/' + uri + '/';

    if( fs.existsSync( __dirname + path ) ) {

        let rank = getJSONFile( path + 'rank' );

        return {
            info: getJSONFile( path + 'info' ),
            bio: getJSONFile( path + 'bio' ),
            rank: rank,
            hasRank: ( rank?.rtb?.date || null ) == latest,
            related: getJSONFile( path + 'related' ),
            history: getCSVFile( path + 'history' ),
            assets: getJSONFile( path + 'assets' ),
            latest: getJSONFile( path + 'latest' ),
            annual: getAnnualReport( uri )
        };

    }

    return null;

};

/**
 * get annual report from profile
 * @param {String} uri profile URI
 * @returns annual report
 */
const getAnnualReport = ( uri ) => {

    let report = getJSONFile( '/profile/' + uri + '/annual' ),
        charts = {
            networth: [],
            rank: []
        };

    if( Object.keys( report ) ) {

        for( const [ year, row ] of Object.entries( report ).slice( -10 ) ) {

            charts.networth.push( [
                year, row.networth.latest
            ] );

            charts.rank.push( [
                year, row.rank.latest
            ] );

        }

        return charts;

    }

    return null;

};

/**
 * check if list exists
 * @param {String} list list name
 * @returns boolean, if list exists
 */
const isList = ( list ) => {

    let path = __dirname + '/list/' + list + '/';

    return list in lists && fs.existsSync( path ) && fs.existsSync( path + 'latest' );

}

/**
 * get (filtered) list
 * @param {String} list list name
 * @param {Object} query query params
 * @returns list object
 */
const getList = ( list, query ) => {

    /**
     * get list
     */

    let raw = getJSONFile( '/list/' + list + '/' + ( query.date || 'latest' ) );

    /**
     * filter list by query
     */

    let res = {
        date: raw.date || query.date || latest,
        count: 0,
        woman: 0,
        total: 0,
        list: []
    };

    /**
     * check if list exists
     */

    if( raw.list ) {

        /**
         * filter list
         */

        raw.list.forEach( ( item ) => {

            if(
                ( query.country && item.citizenship != query.country ) ||
                ( query.industry && !item.industry.includes( query.industry ) ) ||
                ( query.woman && item.gender != 'f' ) ||
                ( query.flag && item.flag != query.flag ) ||
                ( query.returnee && item.flag != 'returnee' )
            ) {

                /**
                 * do nothing
                 */

            } else {

                /**
                 * add entry to list
                 */

                res.list.push( item );

                res.count++;
                res.total += item.networth;

                if( item.gender == 'f' ) {

                    res.woman++;

                }

            }

        } );

        res.total = Number( res.total.toFixed(3) );

        /**
         * sort results
         */

        let desc = ( query.dir || 'asc' ) == 'desc';

        res.list = res.list.sort( ( a, b ) => {

            switch( query.sort || 'rank' ) {

                /**
                 * sort by rank (by default)
                 */
                default:
                case 'rank':
                    return desc
                        ? b.rank - a.rank
                        : a.rank - b.rank;

                /**
                 * sort by rank difference
                 */
                case 'diff':
                    return desc
                        ? b.diff - a.diff
                        : a.diff - b.diff;

                /**
                 * sort by name (URI)
                 */
                case 'name':
                    return desc
                        ? b.uri.localeCompare( a.uri )
                        : a.uri.localeCompare( b.uri );

                /**
                 * sort by age
                 */
                case 'age':
                    return desc
                        ? b.age - a.age
                        : a.age - b.age;

            }

        } );

        /**
         * slice results (pagination)
         */

        res.page = parseInt( query.page || 1 );
        res.limit = parseInt( query.limit || 25 );

        res.list = res.list.slice(
            res.limit * ( res.page - 1 ),
            res.limit * res.page
        );

    }

    /**
     * set flag if list has active filters
     */

    res.filtered = ( res.count != raw.count ) || ( res.date != latest );

    /**
     * return list object
     */

    return res;

};

/**
 * fetch movers (winners & losers)
 * @param {String} date date or latest
 * @param {String} type movers type
 * @param {Int} limit movers limit
 * @param {Boolean} resolve resolve URI to name
 * @returns daily movers
 */
const getMovers = ( date = 'latest', type = 'value', limit = 10, resolve = false ) => {

    let winner = getJSONFile( '/movers/' + type + '/winner/' + date ),
        loser = getJSONFile( '/movers/' + type + '/loser/' + date );

    let movers = {
        winner: Array.isArray( winner ) ? winner.slice( 0, limit ) : [],
        loser: Array.isArray( loser ) ? loser.slice( 0, limit ) : []
    };

    if( resolve ) {

        /**
         * resolve URI to name
         */

        movers.winner = movers.winner.map( r => [ getProfileName( r[0], true ), r[1] ] );
        movers.loser = movers.loser.map( r => [ getProfileName( r[0], true ), r[1] ] );

    }

    return movers;

};

/**
 * update API index
 * load profiles index + aliases etc.
 */

var latest, days, index, alias, lists, indexes;

const updateIndex = () => {

    latest = fs.existsSync( __dirname + '/latest' )
        ? fs.readFileSync( __dirname + '/latest' ).toString()
        : ( new Date() ).toISOString().split( 'T' )[0];

    days = getCSVFile( '/availableDays', 0 );

    index = getJSONFile( '/profile/_index' );
    alias = getJSONFile( '/profile/_alias' );

    lists = getJSONFile( '/list/_index' );

    indexes = {
        industry: getJSONFile( '/stats/industry/_index' ),
        country: getJSONFile( '/stats/country/_index' )
    };

};

updateIndex();

/**
 * export public methods
 */
module.exports = {
    latest, days,
    index, alias,
    lists,
    indexes,
    resolveURI,
    getJSONFile,
    saveJSONFile,
    getCSVFile,
    saveCSVFile,
    getProfileName,
    getProfileImage,
    getProfile,
    getFullProfile,
    getAnnualReport,
    isList,
    getList,
    getMovers,
    updateIndex
};