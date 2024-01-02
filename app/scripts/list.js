/**
 * scann for list filtering + sorting
 */
document.addEventListener( 'change', ( e ) => {

    if( e.target.closest( '.rtb-list-filter' ) ) {

        e.target.closest( '.rtb-list-filter' ).submit();

    }

} );