/**
 * rtb // api endpoint
 */

'use strict';

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
 * get CSV content from file
 * @param {String} file path to file
 * @param {Int|Null} flatten get only one column
 * @param {String} delimiter value delimiter
 * @param {String} newLine new line delimiter
 * @returns CSV content
 */
const getCSVFile = ( file, flatten = null, delimiter = ' ', newLine = '\r\n' ) => {

    let res = fs.existsSync( __dirname + file )
        ? fs.readFileSync( __dirname + file )
            .toString()
            .split( newLine )
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
 * @returns name
 */
const getProfileName = ( uri ) => {

    uri = resolveURI( uri );

    if( uri in index ) {

        return index[ uri ].name;

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

        return {
            info: getJSONFile( path + 'info' ),
            bio: getJSONFile( path + 'bio' ),
            rank: getJSONFile( path + 'rank' ),
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

        res.list = res.list.slice( ( res.page - 1 ) * 25, res.page * 25 );

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
 * @returns daily movers
 */
const getMovers = ( date = 'latest', type = 'value', limit = 10 ) => {

    return {
        winner: getJSONFile( '/movers/' + type + '/winner/' + date ).slice( 0, limit ),
        loser: getJSONFile( '/movers/' + type + '/loser/' + date ).slice( 0, limit )
    };

};

/**
 * load profiles index + aliases
 */

const latest = fs.existsSync( __dirname + '/latest' )
    ? fs.readFileSync( __dirname + '/latest' ).toString()
    : ( new Date() ).toISOString().split( 'T' )[0];

const days = getCSVFile( '/availableDays', 0 );

const index = getJSONFile( '/profile/_index' );
const alias = getJSONFile( '/profile/_alias' );

const lists = getJSONFile( '/list/_index' );

const indexes = {
    industry: getJSONFile( '/stats/industry/_index' ),
    country: getJSONFile( '/stats/country/_index' )
};

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
    getCSVFile,
    getProfileName,
    getProfileImage,
    getProfile,
    getFullProfile,
    getAnnualReport,
    isList,
    getList,
    getMovers
};