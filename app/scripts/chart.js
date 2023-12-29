/**
 * create new chart
 * @param {Node} container chart container
 * @param {Object} data chart data
 * @returns chart and ctx
 */
function chart_add( container, data ) {

    let chart = container.querySelector( 'canvas' ),
        ctx = chart.getContext( '2d' );

    new Chart( ctx, data );

    return [ chart, ctx ];

};

/**
 * extract data for chart
 * @param {Array} data chart data
 * @param {Int} limit data point limit
 * @param {Array} range date range
 * @returns extracted data
 */
function chart_data( data, limit = 500, range = [] ) {

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
 * @returns color gradient
 */
function chart_gradient( container, stops ) {

    let ctx = container.querySelector( 'canvas' ).getContext( '2d' ),
        gradient = ctx.createLinearGradient( 0, 0, 0, 400 );

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
                pointHitRadius: 50,
                pointStyle: false,
                lineTension: 0.1,
                borderWidth: 3,
                borderColor: chart_color( rgb ),
                backgroundColor: chart_gradient( container, [
                    chart_color( rgb, 0.5 ),
                    chart_color( rgb, 0 )
                ] ),
                fill: true
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    backgroundColor: 'rgba( 255 255 255 / 0.9 )',
                    borderWidth: 1,
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
    } );

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
                pointHitRadius: 50,
                pointStyle: false,
                lineTension: 0.1,
                borderWidth: 3,
                borderColor: chart_color( rgb )
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    backgroundColor: 'rgba( 255 255 255 / 0.9 )',
                    borderWidth: 1,
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
    } );

};

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