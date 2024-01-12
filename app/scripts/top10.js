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

        idx = parseInt( idx );

        let width = container.offsetWidth / 10,
            month = Object.keys( data.list )[ idx ] || null;

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

            let sort = Object.keys( profiles ).sort(
                ( a, b ) => profiles[ b ] - profiles[ a ]
            );

            let max = Math.max( ...Object.values( profiles ) ),
                min = Math.min( ...Object.values( profiles ) ) * 0.9,
                range = max - min;

            /**
             * update list
             */

            container.querySelectorAll( '.rtb-top10-profile' ).forEach( ( p ) => {

                let uri = p.getAttribute( 'top10-profile' ),
                    pct = '0%', networth = '$0',
                    left = width * 12;

                if( uri in profiles ) {

                    pct = Math.max( 5, ( profiles[ uri ] - min ) / range * 100 ) + '%';

                    networth = '$' + Number( ( profiles[ uri ] / 1000 ).toFixed( 2 ) ) + 'B';

                    left = sort.indexOf( uri ) * width;

                }

                p.querySelector( '.rtb-top10-profile-column .col' ).style.height = pct;
                p.querySelector( '.rtb-top10-profile-column .col b' ).innerHTML = networth;

                p.style.width = width + 'px';
                p.style.left = left + 'px';

            } );

            /**
             * update month
             */

            container.querySelector( '.rtb-top10-month' ).innerHTML =
                monthNames[ date.getMonth() ] + ' ' +
                date.getFullYear();

            /**
             * update buttons
             */

            let prev = container.querySelector( '.rtb-top10-controls .prev' ),
                next = container.querySelector( '.rtb-top10-controls .next' );

            if( idx > 0 ) {

                prev.classList.remove( 'disabled' );
                prev.setAttribute( 'top10-month', idx - 1 );

            } else {

                prev.classList.add( 'disabled' );

            }

            if( idx < Object.keys( data.list ).length - 1 ) {

                next.classList.remove( 'disabled' );
                next.setAttribute( 'top10-month', idx + 1 );

            } else {

                next.classList.add( 'disabled' );

            }

        }

    };

    /**
     * start top 10
     */
    setTimeout( () => {

        container = document.querySelector( '.rtb-top10-container' );

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
            '<img class="rtb-image rtb-top10-profile-image" src="' + (
                profile.image || '/res/blank-' + (
                    profile.gender || 'm'
                ) + '.jpg'
            ) + '" />' +
            '<div class="rtb-top10-profile-inner">' +
                '<a href="/profile/' + uri + '">' + utf8( profile.name.replace( ' & family', '' ) ) + '</a>' +
                '<span>' + utf8( profile.source.join( ', ' ) ) + '</span>' +
            '</div>';

            container.querySelector( '.rtb-top10-grid' ).appendChild( el );

        }

        /**
         * bind load event to controls
         */

        container.querySelectorAll( '.rtb-top10-controls a' ).forEach( ( a ) => {

            a.addEventListener( 'click', ( e ) => {

                e.preventDefault();

                getTop10( a.getAttribute( 'top10-month' ) );

            } );

        } );

        /**
         * load first month
         */

        getTop10();

    }, 250 );

} );