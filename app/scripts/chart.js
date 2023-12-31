/**
 * global charts object
 * contains all registered charts
 */
var charts = {};

/**
 * global chart color palettes
 */
const chart_colors = {
    schemes: {
        red: [
            '#2a0211', '#4f0420', '#75062e', '#9a073d', '#c0094c', '#e50b5b',
            '#f42370', '#f64888', '#f86ea0', '#fa93b9', '#fcb9d1', '#fddeea'
        ]
    }
};

/**
 * create new chart
 * @param {Node} container chart container
 * @param {Object} options chart options
 * @param {Object} data chart data
 * @param {Boolean} ctrl add chart controls
 * @param {String|Null} range range to select
 * @returns uuid
 */
const chart_add = ( container, options, data, ctrl = true, range = 'year' ) => {

    let uuid = getID(),
        chart = container.querySelector( 'canvas' ),
        ctx = chart.getContext( '2d' );

    /**
     * set ID
     */

    container.id = uuid;

    if( ctrl ) {

        /**
         * add chart controls
         * (range selector)
         */

        let controls = document.createElement( 'div' );

        controls.classList.add( 'rtb-chart-controls' );
        controls.innerHTML = [ 'All', 'Year', 'Quarter', 'Month' ].map( ( r ) => {
            return '<button chart-range="' + r.toLowerCase() + '">' + r + '</button>';
        } ).join( '' );

        container.insertBefore( controls, chart );

    }

    /**
     * create chart
     */

    charts[ uuid ] = {
        container: container,
        chart: new Chart( ctx, options ),
        data: data,
        normalize: !!( container.getAttribute( 'chart-normalize' ) || 0 ),
        split: !!( container.getAttribute( 'chart-split' ) || 0 )
    };

    /**
     * load data
     */

    if( range ) {

        chart_range( uuid, range );

    }

    /**
     * return chart ID
     */

    return uuid;

};

/**
 * update chart data
 * @param {String} uuid chart ID
 * @param {Array} data chart data
 */
const chart_update = ( uuid, data ) => {

    if( uuid in charts ) {

        charts[ uuid ].chart.data.labels = data.map( r => formatDate( r[0] ) );

        for( let i = 1, s = 0; i < Object.keys( data[0] ).length; i++, s++ ) {

            charts[ uuid ].chart.data.datasets[ s ].data = data.map( r => r[ i ] );

        }

        charts[ uuid ].chart.update();

    }

};

/**
 * calculate range and update data
 * @param {String} uuid chart ID
 * @param {String} range data range
 */
const chart_range = ( uuid, range ) => {

    if( uuid in charts ) {

        /**
         * calculate range
         */

        let s = new Date();

        switch( range ) {

            case 'all':
                s = '1970-01-01';
                break;

            case 'year':
                s = s.setFullYear( s.getFullYear() - 1 );
                break;

            case 'quarter':
                s = s.setMonth( s.getMonth() - 3 );
                break;

            case 'month':
                s = s.setMonth( s.getMonth() - 1 );
                break;

        }

        /**
         * active button
         */

        charts[ uuid ].container.querySelectorAll(
            '.rtb-chart-controls button'
        ).forEach( ( button ) => {

            button.classList.remove( 'active' );

        } );

        charts[ uuid ].container.querySelector(
            '.rtb-chart-controls button[chart-range="' + range + '"]'
        ).classList.add( 'active' );

        /**
         * update chart data
         */

        chart_update( uuid, chart_data( uuid, [
            ( new Date( s ) ),
            ( new Date() )
        ] ) );

    }

};

/**
 * extract data for chart
 * @param {String} uuid chart ID
 * @param {Array} range date range
 * @param {Int} limit data point limit
 * @returns extracted data
 */
const chart_data = ( uuid, range = [], limit = 500 ) => {

    if( uuid in charts ) {

        let chart = charts[ uuid ],
            data = JSON.parse( JSON.stringify( chart.data ) );

        if( range.length == 2 ) {

            /**
             * check date range
             */

            let s = new Date( range[0] );
            let e = new Date( range[1] );

            data = data.filter( r => {

                let t = new Date( r[0] );

                return t >= s && t <= e;

            } );

        }

        /**
         * shrink data to fixed limit
         */

        let d = [], l = data.length;

        d.push( data[0] );

        for( let i = 1; i < l - 1; i += Math.ceil( l / limit ) ) {

            d.push( data[ i ] );

        }

        d.push( data[ l - 1 ] );

        /**
         * normalize data if needed
         */

        if( chart.normalize ) {

            return chart_data_normalize( d, 0, chart.split );

        }

        return d;

    }

    return [];

};

/**
 * normalize chart data
 * @param {Array} data chart data
 * @param {Float} n normalize
 * @param {Boolean} split split data
 * @returns normalized data
 */
const chart_data_normalize = ( data, n = 0, split = false ) => {

    let abs = parseFloat( data[0][1] ) - n;

    data = data.map( ( r ) => {

        r[1] = parseFloat( r[1] ) - abs;

        return r;

    } );

    if( split ) {

        data = chart_split_data( data, n );

    }

    return data;

};

/**
 * split chart data in different series
 * @param {Array} data chart data
 * @param {Float} by split value
 * @param {Float|Null} fill split fill
 * @returns splitted data
 */
const chart_split_data = ( data, by = 0, fill = null ) => {

    return data.map( ( r ) => {

        return [
            r[0],
            r[1] > by ? r[1] : fill,
            r[1] < by ? r[1] : fill
        ];

    } );

};

/**
 * create chart color
 * @param {String} rgb rgb color
 * @param {Float} alpha alpha
 * @returns rgba color
 */
const chart_color = ( rgb, alpha = 1 ) => {

    return 'rgba( ' + rgb + ' / ' + alpha + ' )';

};

/**
 * create chart color gradient
 * @param {Node} container chart container
 * @param {Array} stops gradient stops
 * @param {Number} x horizontal stop
 * @param {Number} y vertical stop
 * @returns color gradient
 */
const chart_gradient = ( container, stops, x = 0, y = 400 ) => {

    let ctx = container.querySelector( 'canvas' ).getContext( '2d' ),
        gradient = ctx.createLinearGradient( 0, 0, x, y );

    stops.forEach( ( s, i ) => {

        gradient.addColorStop( i, s );

    } );

    return gradient;

};

/**
 * create (general) number chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__number = ( container, data ) => {

    let rgb = '227 11 92';

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( rgb ),
                backgroundColor: chart_gradient( container, [
                    chart_color( rgb, 0.5 ),
                    chart_color( rgb, 0 )
                ] ),
                fill: true,
                pointRadius: 0,
                pointHoverBackgroundColor: 'rgba( 255 255 255 / 1 )',
                pointHoverBorderColor: chart_color( rgb ),
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: 12
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    padding: {
                        top: 11,
                        left: 12,
                        right: 14,
                        bottom: 4
                    },
                    caretPadding: 10,
                    backgroundColor: 'rgba( 255 255 255 / 0.9 )',
                    borderWidth: 2,
                    borderColor: chart_color( rgb ),
                    cornerRadius: 4,
                    titleColor: 'rgba( 1 2 3 / 1 )',
                    titleFont: {
                        family: 'Poppins, sans-serif',
                        size: 13
                    },
                    bodyColor: chart_color( rgb ),
                    bodyFont: {
                        family: 'Poppins, sans-serif',
                        size: 24,
                        weight: 700
                    }
                }
            },
            scales: {
                x: {
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        color: 'rgba( 245 246 247 / 1 )',
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 4,
                        padding: 12,
                        color: 'rgba( 1 2 3 / 1 )',
                        font: {
                            family: 'Poppins, sans-serif',
                            size: 14,
                            weight: 700
                        },
                        callback: ( value ) => {
                            if( value > 0 && parseInt( value ) == parseFloat( value.toFixed( 1 ) ) ) {
                                return parseInt( value );
                            }
                        }
                    }
                }
            }
        }
    }, data );

};

/**
 * create net worth chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__networth = ( container, data ) => {

    let rgb = '0 182 122';

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( rgb ),
                backgroundColor: chart_gradient( container, [
                    chart_color( rgb, 0.5 ),
                    chart_color( rgb, 0 )
                ] ),
                fill: true,
                pointRadius: 0,
                pointHoverBackgroundColor: 'rgba( 255 255 255 / 1 )',
                pointHoverBorderColor: chart_color( rgb ),
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: 12
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    padding: {
                        top: 11,
                        left: 12,
                        right: 14,
                        bottom: 4
                    },
                    caretPadding: 10,
                    backgroundColor: 'rgba( 255 255 255 / 0.9 )',
                    borderWidth: 2,
                    borderColor: chart_color( rgb ),
                    cornerRadius: 4,
                    titleColor: 'rgba( 1 2 3 / 1 )',
                    titleFont: {
                        family: 'Poppins, sans-serif',
                        size: 13
                    },
                    bodyColor: chart_color( rgb ),
                    bodyFont: {
                        family: 'Poppins, sans-serif',
                        size: 24,
                        weight: 700
                    },
                    callbacks: {
                        label: ( item ) => {
                            return '$' + parseFloat( ( item.parsed.y / 1000 ).toFixed( 2 ) ) + 'B';
                        }
                    }
                }
            },
            scales: {
                x: {
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        color: 'rgba( 245 246 247 / 1 )',
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 6,
                        padding: 12,
                        color: 'rgba( 1 2 3 / 1 )',
                        font: {
                            family: 'Poppins, sans-serif',
                            size: 14,
                            weight: 700
                        },
                        callback: ( value ) => {
                            if( value > 0 ) {
                                return '$' + parseFloat( ( value / 1000 ).toFixed( 1 ) ) + 'B';
                            }
                        }
                    }
                }
            }
        }
    }, data );

};

/**
 * create ranking chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__rank = ( container, data ) => {

    let rgb = '227 11 92';

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( rgb ),
                pointRadius: 0,
                pointHoverBackgroundColor: 'rgba( 255 255 255 / 1 )',
                pointHoverBorderColor: chart_color( rgb ),
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: 12
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    padding: {
                        top: 11,
                        left: 12,
                        right: 14,
                        bottom: 4
                    },
                    caretPadding: 10,
                    backgroundColor: 'rgba( 255 255 255 / 0.9 )',
                    borderWidth: 2,
                    borderColor: chart_color( rgb ),
                    cornerRadius: 4,
                    titleColor: 'rgba( 1 2 3 / 1 )',
                    titleFont: {
                        family: 'Poppins, sans-serif',
                        size: 13
                    },
                    bodyColor: chart_color( rgb ),
                    bodyFont: {
                        family: 'Poppins, sans-serif',
                        size: 24,
                        weight: 700
                    },
                    callbacks: {
                        label: ( item ) => {
                            return '#' + item.parsed.y;
                        }
                    }
                }
            },
            scales: {
                x: {
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    reverse: true,
                    border: {
                        display: false
                    },
                    grid: {
                        color: 'rgba( 245 246 247 / 1 )',
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 4,
                        padding: 12,
                        color: 'rgba( 1 2 3 / 1 )',
                        font: {
                            family: 'Poppins, sans-serif',
                            size: 14,
                            weight: 700
                        },
                        callback: ( value ) => {
                            if( value > 0 && parseInt( value ) == parseFloat( value.toFixed( 1 ) ) ) {
                                return '#' + parseInt( value );
                            }
                        }
                    }
                }
            }
        }
    }, data );

};

/**
 * create percentage chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__percent = ( container, data ) => {

    let rgb_pos = '0 182 122',
        rgb_neg = '227 11 92';

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( rgb_pos ),
                backgroundColor: chart_color( rgb_pos, 0.5 ),
                fill: true,
                pointRadius: 0,
                pointHoverBackgroundColor: 'rgba( 255 255 255 / 1 )',
                pointHoverBorderColor: chart_color( rgb_pos ),
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6
            }, {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( rgb_neg ),
                backgroundColor: chart_color( rgb_neg, 0.5 ),
                fill: true,
                pointRadius: 0,
                pointHoverBackgroundColor: 'rgba( 255 255 255 / 1 )',
                pointHoverBorderColor: chart_color( rgb_neg ),
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: 12
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    padding: {
                        top: 11,
                        left: 12,
                        right: 14,
                        bottom: 4
                    },
                    caretPadding: 10,
                    backgroundColor: 'rgba( 255 255 255 / 0.9 )',
                    borderWidth: 2,
                    borderColor: 'rgba( 1 2 3 / 1 )',
                    cornerRadius: 4,
                    titleColor: 'rgba( 1 2 3 / 1 )',
                    titleFont: {
                        family: 'Poppins, sans-serif',
                        size: 13
                    },
                    bodyColor: 'rgba( 1 2 3 / 1 )',
                    bodyFont: {
                        family: 'Poppins, sans-serif',
                        size: 24,
                        weight: 700
                    },
                    filter: ( item ) => {
                        return item.parsed.y != 0;
                    },
                    callbacks: {
                        label: ( item ) => {
                            return Number( item.parsed.y.toFixed( 2 ) ) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        color: 'rgba( 245 246 247 / 1 )',
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 4,
                        padding: 12,
                        color: 'rgba( 1 2 3 / 1 )',
                        font: {
                            family: 'Poppins, sans-serif',
                            size: 14,
                            weight: 700
                        },
                        callback: ( value ) => {
                            return Number( value.toFixed( 2 ) ) + '%';
                        }
                    }
                }
            }
        }
    }, data );

};

/**
 * create pie chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__pie = ( container, data ) => {

    let total = Object.values( data ).reduce( ( a, c ) => a + c, 0 );

    chart_add( container, {
        type: 'pie',
        data: {
            labels: Object.keys( data ).map( ( a ) => {
                return capitalize( a.replaceAll( '-', ' ' ) ) + ' — ' + (
                    data[ a ] / total * 100
                ).toFixed( 1 ) + '%'
            } ),
            datasets: [ {
                data: Object.values( data ),
                backgroundColor: chart_colors.schemes.red
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: 12
            },
            events: [],
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 20,
                        color: 'rgba( 1 2 3 / 1 )',
                        font: {
                            family: 'Poppins, sans-serif',
                            size: 14,
                            weight: 700
                        }
                    }
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    }, data, false, null );

};

/**
 * register chart types
 */
const chart_types = {
    'number': chart_type__number,
    'networth': chart_type__networth,
    'rank': chart_type__rank,
    'percent': chart_type__percent,
    'pie': chart_type__pie
};

/**
 * chart controls
 */
document.addEventListener( 'click', ( e ) => {

    if(
        e.target.tagName.toLowerCase() == 'button' &&
        !e.target.classList.contains( 'active' ) &&
        e.target.parentNode.classList.contains( 'rtb-chart-controls' )
    ) {

        let range = e.target.getAttribute( 'chart-range' ),
            uuid = e.target.closest( '.rtb-chart' ).id;

        chart_range( uuid, range );

    }

} );

/**
 * search for charts after DOM content has loaded
 * process chart data
 */
document.addEventListener( 'DOMContentLoaded', () => {

    document.querySelectorAll( '.rtb-chart' ).forEach( ( container ) => {

        let type = container.getAttribute( 'chart-type' ) || '',
            data = JSON.parse( window.atob( container.getAttribute( 'chart-data' ) ) );

        if( type in chart_types ) {

            chart_types[ type ]( container, data );

        }

    } );

} );