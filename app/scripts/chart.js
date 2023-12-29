var charts = {};

/**
 * create new chart
 * @param {Node} container chart container
 * @param {Object} options chart options
 * @param {Object} data chart data
 * @returns uuid
 */
function chart_add( container, options, data ) {

    let uuid = getID(),
        chart = container.querySelector( 'canvas' ),
        ctx = chart.getContext( '2d' );

    /**
     * set ID
     */

    container.id = uuid;

    /**
     * add range selector
     */

    let controls = document.createElement( 'div' );

    controls.classList.add( 'rtb-chart-controls' );
    controls.innerHTML = [ 'All', 'Year', 'Quarter', 'Month' ].map( ( r ) => {
        return '<button chart-range="' + r.toLowerCase() + '">' + r + '</button>';
    } ).join( '' );

    controls.querySelector( '[chart-range="all"]' ).classList.add( 'active' );

    container.insertBefore( controls, chart );

    /**
     * create chart
     */

    charts[ uuid ] = {
        container: container,
        chart: new Chart( ctx, options ),
        data: data
    };

    return uuid;

};

/**
 * update chart data
 * @param {String} uuid chart ID
 * @param {Array} data chart data
 */
function chart_update( uuid, data ) {

    if( uuid in charts ) {

        charts[ uuid ].chart.data.labels = data.map( r => r[0].replaceAll( '-', '/' ) );
        charts[ uuid ].chart.data.datasets[0].data = data.map( r => r[1] );

        charts[ uuid ].chart.update();

    }

};

/**
 * calculate range and update data
 * @param {String} uuid chart ID
 * @param {String} range data range
 */
function chart_range( uuid, range ) {

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

        chart_update( uuid, chart_data(
            charts[ uuid ].data,
            [
                ( new Date( s ) ),
                ( new Date() )
            ]
        ) );

    }

};

/**
 * extract data for chart
 * @param {Array} data chart data
 * @param {Array} range date range
 * @param {Int} limit data point limit
 * @returns extracted data
 */
function chart_data( data, range = [], limit = 500 ) {

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

    return d;

};

/**
 * create chart color
 * @param {String} rgb rgb color
 * @param {Float} alpha alpha
 * @returns rgba color
 */
function chart_color( rgb, alpha = 1 ) {

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
function chart_gradient( container, stops, x = 0, y = 400 ) {

    let ctx = container.querySelector( 'canvas' ).getContext( '2d' ),
        gradient = ctx.createLinearGradient( 0, 0, x, y );

    stops.forEach( ( s, i ) => {

        gradient.addColorStop( i, s );

    } );

    return gradient;

};

/**
 * create net worth chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
function chart_networth( container, data ) {

    let rgb = '0 182 122',
        d = chart_data( data );

    chart_add( container, {
        type: 'line',
        data: {
            labels: d.map( r => r[0].replaceAll( '-', '/' ) ),
            datasets: [ {
                data: d.map( r => r[1] ),
                lineTension: 0.1,
                pointHitRadius: 50,
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
                    titleColor: 'rgba( 0 0 0 / 1 )',
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
                        color: 'rgba( 0 0 0 / 1 )',
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
function chart_rank( container, data ) {

    let rgb = '227 11 92',
        d = chart_data( data );

    chart_add( container, {
        type: 'line',
        data: {
            labels: d.map( r => r[0].replaceAll( '-', '/' ) ),
            datasets: [ {
                data: d.map( r => r[1] ),
                lineTension: 0.1,
                pointHitRadius: 50,
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
                    titleColor: 'rgba( 0 0 0 / 1 )',
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
                        color: 'rgba( 0 0 0 / 1 )',
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
            data = JSON.parse( window.atob( container.getAttribute( 'chart-data' ) ) ),
            fn = 'chart_' + type;

        if( typeof window[ fn ] === 'function' ) {

            window[ fn ]( container, data );

        }

    } );

} );