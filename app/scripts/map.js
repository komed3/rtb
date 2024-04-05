/**
 * search for maps after DOM content has loaded
 * process map data
 */
document.addEventListener( 'DOMContentLoaded', () => {

    document.querySelectorAll( '.rtb-map' ).forEach( ( container ) => {

        let lat = parseFloat( container.getAttribute( 'lat' ) || 0 ),
            lon = parseFloat( container.getAttribute( 'lon' ) || 0 );

        let map = L.map( container, {
            zoomControl: false
        } );

        map.attributionControl.setPrefix( false );

        L.tileLayer( 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
            maxZoom: 17,
            minZoom: 12
        } ).addTo( map );

        L.marker( [ lat, lon ] ).addTo( map );

        setTimeout( () => {
            map.setView( [ lat, lon ], 16 );
        }, 250 );

    } );

} );