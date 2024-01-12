/**
 * search for container after DOM content has loaded
 * add profiles to grid and load first month
 */
document.addEventListener( 'DOMContentLoaded', () => {

    let container;
    let data;

    /**
     * get month by index
     * @param {Int} idx list index
     */
    const getTop10 = ( idx = 0 ) => {

        let month = Object.keys( data.list )[ idx ] || null;

        if( month ) {

            let date = new Date( month + '-01' ),
                list = data.list[ month ],
                profiles = {};

            /**
             * build new list data
             */

            list.forEach( ( p ) => {

                profiles[ p.uri ] = parseFloat( p.networth );

            } );

            let max = Math.max( ...Object.values( profiles ) ),
                min = Math.min( ...Object.values( profiles ) ) * 0.9,
                range = max - min;

            /**
             * update list
             */

            container.querySelectorAll( '.rtb-top10-profile' ).forEach( ( p ) => {

                let uri = p.getAttribute( 'top10-profile' ),
                    pct = '0%', networth = '$0';

                if( uri in profiles ) {

                    pct = Math.max( 5, ( profiles[ uri ] - min ) / range * 100 ) + '%';

                    networth = '$' + Number( ( profiles[ uri ] / 1000 ).toFixed( 2 ) ) + 'B';

                }

                p.querySelector( '.rtb-top10-profile-column .col' ).style.height = pct;
                p.querySelector( '.rtb-top10-profile-column .col b' ).innerHTML = networth;

            } );

            /**
             * update month
             */

            container.querySelector( '.rtb-top10-month' ).innerHTML =
                monthNames[ date.getMonth() ] + ' ' +
                date.getFullYear();

        }

    };

    document.querySelectorAll( '.rtb-top10-container' ).forEach( ( c ) => {

        container = c;

        data = JSON.parse(
            window.atob(
                container.getAttribute( 'top10-data' )
            )
        );

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

            container.querySelector( '.rtb-top10-grid' ).appendChild( el );

        }

        /**
         * load first month
         */

        getTop10();

    } );

} );