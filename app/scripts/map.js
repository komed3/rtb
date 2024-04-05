/**
 * search for maps after DOM content has loaded
 * process map data
 */
document.addEventListener( 'DOMContentLoaded', () => {

    document.querySelectorAll( '.rtb-map' ).forEach( ( container ) => {

        let lat = parseFloat( container.getAttribute( 'lat' ) || 0 ),
            lon = parseFloat( container.getAttribute( 'lon' ) || 0 );

        let map = L.map( container, {
            zoomControl: false,
            maxZoom: 18,
            minZoom: 12
        } );

        map.attributionControl.setPrefix( false );

        L.tileLayer( 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            attribution: '© OpenStreetMap contributors © CARTO'
        } ).addTo( map );

        L.marker( [ lat, lon ], {
            icon: L.icon( {
                iconUrl: '/res/marker.png',
                iconSize: [ 24, 24 ],
                iconAnchor: [ 12, 24 ],
            } )
        } ).addTo( map );

        setTimeout( () => {
            map.invalidateSize();
            map.setView( [ lat, lon ], 16 );
        }, 500 );

    } );

} );