/**
 * search for container after DOM content has loaded
 * add profiles to grid and load first month
 */
document.addEventListener( 'DOMContentLoaded', () => {

    let container;
    let data;

    /**
     * play top 10
     */
    const playTop10 = () => {

        /**
         * disable all controls
         */

        container.querySelectorAll( '.rtb-top10-controls a' ).forEach( ( a ) => {

            a.classList.add( 'disabled' );

        } );

        /**
         * loop trougth month
         */

        let last = Object.keys( data.list ).length - 1;

        const playMonth = ( idx = 0 ) => {

            idx = parseInt( idx );

            /**
             * get current month
             */

            getTop10( idx, true );

            if( idx < last ) {

                /**
                 * get next month after timeout
                 */

                setTimeout( () => {
                    playMonth( idx + 1 );
                }, 2500 );

            } else {

                /**
                 * activate play button
                 */

                container.querySelector( '.rtb-top10-controls a.play' ).classList.remove( 'disabled' );

                getTop10( idx );

            }

        };

        /**
         * start animation
         */

        playMonth();

    };

    /**
     * get month by index
     * @param {Int} idx list index
     * @param {Boolean} playState player state
     */
    const getTop10 = ( idx = 0, playState = false ) => {

        idx = parseInt( idx );

        let height = container.querySelector( '.rtb-top10-grid' ).offsetHeight / 10,
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
                    top = height * 12;

                if( uri in profiles ) {

                    pct = Math.max( 15, ( profiles[ uri ] - min ) / range * 100 ) + '%';

                    networth = '$' + Number( ( profiles[ uri ] / 1000 ).toFixed( 1 ) ) + 'B';

                    top = sort.indexOf( uri ) * height;

                }

                p.querySelector( '.rtb-top10-profile-column .col' ).style.width = pct;
                p.querySelector( '.rtb-top10-profile-column .col b' ).innerHTML = networth;

                p.style.height = height + 'px';
                p.style.top = top + 'px';

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

            if( !playState && idx > 0 ) {

                prev.classList.remove( 'disabled' );
                prev.setAttribute( 'top10-month', idx - 1 );

            } else {

                prev.classList.add( 'disabled' );

            }

            if( !playState && idx < Object.keys( data.list ).length - 1 ) {

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
         * bind events to controls
         */

        container.querySelectorAll( '.rtb-top10-controls a' ).forEach( ( a ) => {

            a.addEventListener( 'click', ( e ) => {

                e.preventDefault();

                if( a.classList.contains( 'play' ) ) {

                    playTop10();

                } else {

                    getTop10( a.getAttribute( 'top10-month' ) );

                }

            } );

        } );

        /**
         * key bindings
         */

        document.onkeyup = function( e ) {

            switch( e.key ) {

                case 'Enter':
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    document.querySelector( '.rtb-top10-controls .play' ).click();
                    break;

                case 'ArrowLeft':
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    document.querySelector( '.rtb-top10-controls .prev' ).click();
                    break;

                case 'ArrowRight':
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    document.querySelector( '.rtb-top10-controls .next' ).click();
                    break;

            }

        };

        /**
         * load first month
         */

        getTop10();

    }, 250 );

} );