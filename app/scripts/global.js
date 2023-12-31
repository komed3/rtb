/**
 * create a unique ID
 * @returns uuid
 */
const getID = () => {

	return '_' + Math.floor( Math.random() * Date.now() ).toString().padStart( 15, '0' );

};

/**
 * capitalize string
 * @param {String} str string
 * @returns capitalized string
 */
const capitalize = ( str ) => {

    return str.charAt( 0 ).toUpperCase() + str.slice( 1 );

};

/**
 * format date to MM/DD/YY
 * @param {String|Date} ts timestamp or date
 * @returns formatted date string
 */
const formatDate = ( ts ) => {

    let date = new Date( ts );

    return ( date.getMonth() + 1 ).toString().padStart( 2, '0' ) + '/' +
        date.getDate().toString().padStart( 2, '0' ) + '/' +
    	date.getFullYear().toString().substring( 2 );

};