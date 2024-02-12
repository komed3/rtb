import SVGWorld from '/svgworld/index.js';
import world from '/svgworld/maps/world.json' assert { type: 'json' };
import colorScale from '/svgworld/plugins/colorScale.js';

var container = document.getElementById( 'map' );

new SVGWorld( container, {
    map: world,
    data: JSON.parse( window.atob( container.getAttribute( 'map-data' ) ) ),
    options: {
        path: {
            emptyStyle: {
                fill: '#d3d4d5'
            }
        },
        plugins: {
            colorScale: {
                minColor: '#2a0211',
                maxColor: '#e30b5c',
                scaleType: 'logarithmic'
            }
        },
        callbacks: {
            afterAssignData: colorScale
        }
    }
} );