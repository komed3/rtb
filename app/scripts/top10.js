document.addEventListener( 'DOMContentLoaded', () => {

    document.querySelectorAll( '.rtb-top10-container' ).forEach( ( container ) => {

        let data = JSON.parse( window.atob( container.getAttribute( 'top10-data' ) ) ),
            grid = container.querySelector( '.rtb-top10-grid' );

        /**
         * add profiles
         */

        for( const [ uri, profile ] of Object.entries( data.profiles ) ) {

            let el = document.createElement( 'div' );

            el.classList.add( 'rtb-top10-profile' );
            el.setAttribute( 'top10-profile', uri );

            el.innerHTML = '<div class="rtb-top10-profile-column">' +
                '<div class="col"><b>$0</b></div>' +
            '</div>' +
            '<div class="rtb-top10-profile-image">' +
            '<img src="' + (
                    profile.image || '/res/blank-' + (
                        profile.gender || 'm'
                    ) + '.jpg'
                ) + '" loading="lazy" />' +
            '</div>' +
            '<div class="rtb-top10-profile-inner">' +
                '<a href="/profile/' + uri + '">' + utf8( profile.name ) + '</a>' +
                '<span>' + utf8( profile.source.join( ', ' ) ) + '</span>' +
            '</div>';

            grid.appendChild( el );

        }

    } );

} );