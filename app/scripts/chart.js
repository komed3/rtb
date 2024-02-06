/**
 * global chart color palettes
 */
const chart_colors = {
    color: '1 2 3',
    background: '255 255 255',
    grid: '245 246 247',
    red: '227 11 92',
    green: '0 182 122',
    schemes: {
        red: [
            '#2a0211', '#4f0420', '#75062e', '#9a073d', '#c0094c', '#e50b5b',
            '#f42370', '#f64888', '#f86ea0', '#fa93b9', '#fcb9d1', '#fddeea'
        ]
    }
};

/**
 * global charts object
 * contains all registered charts
 */
var charts = {};

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
        container.classList.add( 'has-controls' );

    }

    /**
     * empty chart message
     */

    let empty = document.createElement( 'div' );

    empty.classList.add( 'rtb-chart-empty' );
    empty.innerHTML = 'No data.';

    empty.style.display = 'none';

    container.insertBefore( empty, chart );

    /**
     * create chart
     */

    charts[ uuid ] = {
        container: container,
        target: chart,
        ctx: ctx,
        empty: empty,
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
 * @param {Boolean} format format date
 */
const chart_update = ( uuid, data, format = true ) => {

    if( uuid in charts ) {

        let chart = charts[ uuid ];

        /**
         * set x axis offset
         */

        chart.chart.options.scales.x.offset = data.length < 2;

        /**
         * check empty chart + assign new chart data
         */

        if( data.every( r => !Array.isArray( r ) || r[1] === null || r[1] === 0 ) ) {

            chart.chart.data.labels = [];

            for( let s = 0; s < chart.chart.data.datasets.length; s++ ) {

                chart.chart.data.datasets[ s ].data = [];

            }

            chart.target.style.display = 'none';
            chart.empty.style.display = 'block';

        } else {

            if( format ) {

                /**
                 * format date (MM/DD/YY)
                 */

                chart.chart.data.labels = data.map( r => formatDate( r[0] ) );

            } else {

                chart.chart.data.labels = data.map( r => r[0] );

            }

            for( let i = 1, s = 0; i < Object.keys( data[0] ).length; i++, s++ ) {

                chart.chart.data.datasets[ s ].data = data.map( r => r[ i ] );

            }

            chart.target.style.display = 'block';
            chart.empty.style.display = 'none';

        }

        /**
         * update chart
         */

        chart.chart.update();

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

        data = chart_split_data( data, n ).slice( 2 );

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
 * @returns color gradient
 */
const chart_gradient = ( container, stops ) => {

    let classes = container.classList.value,
        y = classes.includes( 'big' ) ? 400 : classes.includes( 'medium' ) ? 300 : 160;

    let ctx = container.querySelector( 'canvas' ).getContext( '2d' ),
        gradient = ctx.createLinearGradient( 0, 0, 0, y );

    stops.forEach( ( s, i ) => {

        gradient.addColorStop( i, s );

    } );

    return gradient;

};

/**
 * format chart values
 * @param {Float} value input
 * @param {String} type callback type
 * @returns formatted value
 */
const chart_callback = ( value, type = 'number' ) => {

    switch( type ) {

        default:
            return value;

        case 'integer':
            return parseInt( value );

        case 'networth':
            return ( value < 0 ? '-$' : '$' ) + parseFloat(
                ( Math.abs( value ) / 1000 ).toFixed( 2 )
            ) + 'B';

        case 'rank':
            return '#' + parseInt( value );

        case 'percent':
            return Number( parseFloat( value ).toFixed( 2 ) ) + '%';

    }

};

/* ------------------------------------------------------------------------------------ */

/**
 * create net worth chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__networth = ( container, data ) => {

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( chart_colors.green ),
                backgroundColor: chart_gradient( container, [
                    chart_color( chart_colors.green, 0.5 ),
                    chart_color( chart_colors.green, 0 )
                ] ),
                fill: true,
                pointRadius: 0,
                pointHoverBackgroundColor: chart_color( chart_colors.background ),
                pointHoverBorderColor: chart_color( chart_colors.green ),
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
                    backgroundColor: chart_color( chart_colors.background, 0.9 ),
                    borderWidth: 2,
                    borderColor: chart_color( chart_colors.green ),
                    cornerRadius: 4,
                    titleColor: chart_color( chart_colors.color ),
                    bodyColor: chart_color( chart_colors.green ),
                    bodyFont: {
                        size: 24
                    },
                    callbacks: {
                        label: ( item ) => {
                            return chart_callback( item.parsed.y, 'networth' );
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
                        color: chart_color( chart_colors.grid ),
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 6,
                        padding: 12,
                        color: chart_color( chart_colors.color ),
                        callback: ( value ) => {
                            if( value > 0 ) {
                                return chart_callback( value, 'networth' );
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

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( chart_colors.red ),
                pointRadius: 0,
                pointHoverBackgroundColor: chart_color( chart_colors.background ),
                pointHoverBorderColor: chart_color( chart_colors.red ),
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
                    backgroundColor: chart_color( chart_colors.background, 0.9 ),
                    borderWidth: 2,
                    borderColor: chart_color( chart_colors.red ),
                    cornerRadius: 4,
                    titleColor: chart_color( chart_colors.color ),
                    bodyColor: chart_color( chart_colors.red ),
                    bodyFont: {
                        size: 24
                    },
                    callbacks: {
                        label: ( item ) => {
                            return chart_callback( item.parsed.y, 'rank' );
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
                        color: chart_color( chart_colors.grid ),
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 4,
                        padding: 12,
                        color: chart_color( chart_colors.color ),
                        callback: ( value ) => {
                            if( value > 0 && parseInt( value ) == parseFloat( value.toFixed( 1 ) ) ) {
                                return chart_callback( value, 'rank' );
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

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( chart_colors.color ),
                pointRadius: 0,
                pointHoverBackgroundColor: chart_color( chart_colors.background ),
                pointHoverBorderColor: chart_color( chart_colors.color ),
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
                    backgroundColor: chart_color( chart_colors.background, 0.9 ),
                    borderWidth: 2,
                    borderColor: chart_color( chart_colors.color ),
                    cornerRadius: 4,
                    titleColor: chart_color( chart_colors.color ),
                    bodyColor: chart_color( chart_colors.color ),
                    bodyFont: {
                        size: 24
                    },
                    callbacks: {
                        label: ( item ) => {
                            return chart_callback( item.parsed.y, 'percent' );
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
                        color: chart_color( chart_colors.grid ),
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 4,
                        padding: 12,
                        color: chart_color( chart_colors.color ),
                        callback: ( value ) => {
                            return chart_callback( value, 'percent' );
                        }
                    }
                }
            }
        }
    }, data );

};

/**
 * create line chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__line = ( container, data ) => {

    chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 3,
                borderColor: chart_color( chart_colors.red ),
                backgroundColor: chart_gradient( container, [
                    chart_color( chart_colors.red, 0.5 ),
                    chart_color( chart_colors.red, 0 )
                ] ),
                fill: true,
                pointRadius: 0,
                pointHoverBackgroundColor: chart_color( chart_colors.background ),
                pointHoverBorderColor: chart_color( chart_colors.red ),
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
                    backgroundColor: chart_color( chart_colors.background, 0.9 ),
                    borderWidth: 2,
                    borderColor: chart_color( chart_colors.red ),
                    cornerRadius: 4,
                    titleColor: chart_color( chart_colors.color ),
                    bodyColor: chart_color( chart_colors.red ),
                    bodyFont: {
                        size: 24
                    },
                    callbacks: {
                        label: ( item ) => {
                            return chart_callback( item.parsed.y, 'integer' );
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
                        color: chart_color( chart_colors.grid ),
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 4,
                        padding: 12,
                        color: chart_color( chart_colors.color ),
                        callback: ( value ) => {
                            if( value > 0 && parseInt( value ) == parseFloat( value.toFixed( 1 ) ) ) {
                                return chart_callback( value, 'integer' );
                            }
                        }
                    }
                }
            }
        }
    }, data );

};

/**
 * create bar chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__bar = ( container, data ) => {

    chart_add( container, {
        type: 'bar',
        data: {
            labels: Object.keys( data ).map( a => capitalize( a.replaceAll( '-', ' ' ) ) ),
            datasets: [ {
                data: Object.values( data ),
                borderWidth: 3,
                borderColor: chart_color( chart_colors.background ),
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
                    display: false
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
                        color: chart_color( chart_colors.color )
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        color: chart_color( chart_colors.grid ),
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        maxTicksLimit: 4,
                        padding: 12,
                        color: chart_color( chart_colors.color )
                    }
                }
            }
        }
    }, data, false, null );

};

/**
 * create column chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__column = ( container, data ) => {

    chart_add( container, {
        type: 'bar',
        data: {
            labels: Object.keys( data ).map( a => capitalize( a.replaceAll( '-', ' ' ) ) ),
            datasets: [ {
                data: Object.values( data ),
                borderWidth: 3,
                borderColor: chart_color( chart_colors.background ),
                backgroundColor: chart_colors.schemes.red
            } ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: {
                    top: 12,
                    left: 12,
                    right: 32,
                    bottom: 12
                }
            },
            events: [],
            plugins: {
                legend: {
                    display: false
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
                        color: chart_color( chart_colors.color )
                    }
                },
                y: {
                    border: {
                        display: false
                    },
                    grid: {
                        color: chart_color( chart_colors.grid ),
                        lineWidth: 2,
                        tickLength: 0
                    },
                    ticks: {
                        padding: 24,
                        crossAlign: 'far',
                        color: chart_color( chart_colors.color )
                    }
                }
            }
        }
    }, data, false, null );

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
                borderWidth: 3,
                borderColor: chart_color( chart_colors.background ),
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
                        color: chart_color( chart_colors.color )
                    }
                }
            }
        }
    }, data, false, null );

};

/**
 * create age pyramid
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__pyramid = ( container, data ) => {

    let total = {
        m: Object.values( data.m ).reduce( ( a, c ) => a + c, 0 ),
        f: Object.values( data.f ).reduce( ( a, c ) => a + c, 0 )
    };

    chart_add( container, {
        type: 'bar',
        data: {
            labels: Object.keys( data.m ).map( ( a ) => {
                return a + ' to ' + ( parseInt( a ) + 9 )
            } ),
            datasets: [ {
                label: 'Male',
                data: Object.values( data.m ).map( a => a / total.m * -100 ),
                borderWidth: 0,
                backgroundColor: chart_color( chart_colors.green ),
                barPercentage: 0.9,
                categoryPercentage: 0.9
            }, {
                label: 'Female',
                data: Object.values( data.f ).map( a => a / total.f * 100 ),
                borderWidth: 0,
                backgroundColor: chart_color( chart_colors.red ),
                barPercentage: 0.9,
                categoryPercentage: 0.9
            } ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: {
                    top: 12,
                    left: 12,
                    right: 32,
                    bottom: 12
                }
            },
            events: [],
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        color: chart_color( chart_colors.color )
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    border: {
                        display: false
                    },
                    grid: {
                        color: chart_color( chart_colors.background ),
                        lineWidth: 3
                    },
                    ticks: {
                        color: chart_color( chart_colors.color ),
                        callback: ( value ) => {
                            return Math.abs( value ) + '%';
                        }
                    }
                },
                y: {
                    reverse: true,
                    stacked: true,
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 12,
                        color: chart_color( chart_colors.color )
                    }
                }
            }
        }
    }, data, false, null );

};

/**
 * create (annual) report chart
 * @param {Node} container chart container
 * @param {Array} data chart data
 */
const chart_type__report = ( container, data ) => {

    let cbType = container.getAttribute( 'chart-callback' ) || null;

    let uuid = chart_add( container, {
        type: 'line',
        data: {
            labels: [],
            datasets: [ {
                data: [],
                lineTension: 0.05,
                pointHitRadius: 100,
                borderWidth: 4,
                borderColor: chart_color( chart_colors.color ),
                pointBackgroundColor: chart_color( chart_colors.background ),
                pointBorderColor: chart_color( chart_colors.color ),
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverBackgroundColor: chart_color( chart_colors.background ),
                pointHoverBorderColor: chart_color( chart_colors.color ),
                pointHoverBorderWidth: 3,
                pointHoverRadius: 4
            } ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            offset: true,
            clip: false,
            layout: {
                padding: {
                    top: 12,
                    left: 32,
                    right: 32,
                    bottom: -20
                }
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
                    backgroundColor: chart_color( chart_colors.background, 0.9 ),
                    borderWidth: 2,
                    borderColor: chart_color( chart_colors.color ),
                    cornerRadius: 4,
                    titleColor: chart_color( chart_colors.color ),
                    bodyColor: chart_color( chart_colors.red ),
                    bodyFont: {
                        size: 24
                    },
                    callbacks: {
                        label: ( item ) => {
                            return chart_callback( item.parsed.y, cbType );
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
                        maxTicksLimit: 5,
                        padding: 24,
                        color: chart_color( chart_colors.color )
                    }
                },
                y: {
                    reverse: cbType == 'rank',
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                }
            }
        }
    }, data, false, null );

    if( uuid ) {

        chart_update(
            uuid,
            data.filter( r => r[1] != null ),
            false
        );

    }

};

/**
 * register chart types
 */
const chart_types = {
    'networth': chart_type__networth,
    'rank': chart_type__rank,
    'percent': chart_type__percent,
    'line': chart_type__line,
    'bar': chart_type__bar,
    'column': chart_type__column,
    'pie': chart_type__pie,
    'pyramid': chart_type__pyramid,
    'report': chart_type__report
};

/* ------------------------------------------------------------------------------------ */

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
 * overide global chart settings
 */
Chart.defaults.font.family = '"Poppins", sans-serif';
Chart.defaults.font.size = 14;
Chart.defaults.font.weight = 700;

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