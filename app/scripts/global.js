/**
 * create a unique ID
 * @returns uuid
 */
const getID = () => {

	return '_' + Math.floor( Math.random() * Date.now() ).toString().padStart( 15, '0' );

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