document.addEventListener( 'DOMContentLoaded', function () {

    /**
     * get chart context
     */

    let __chart_ntw = document.getElementById( '__chart_ntw' );

    if( __chart_ntw ) {

        /**
         * process chart data
         */

        let __chart_ntw__data = [];

        __chart_ntw__data.push( _history[0] );

        for( let i = 1; i < _history.length - 1; i += Math.round( _history.length / 400 ) ) {

            __chart_ntw__data.push( _history[ i ] );

        }

        __chart_ntw__data.push( _history[ _history.length - 1 ] );

        /**
         * create new chart
         */

        new Chart( __chart_ntw.getContext( '2d' ), {
            type: 'line',
            data: {
                labels: __chart_ntw__data.map( r => r[0].replaceAll( '-', '/' ) ),
                datasets: [ {
                    data: __chart_ntw__data.map( r => r[2] ),
                    pointHitRadius: 50,
                    pointStyle: false,
                    lineTension: 0.1,
                    borderWidth: 3,
                    borderColor: 'rgba( 0 182 122 / 1 )',
                    backgroundColor: 'rgba( 0 182 122 / 0.2 )',
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
                        borderColor: 'rgba( 0 182 122 / 1 )',
                        cornerRadius: 4,
                        titleColor: 'rgba( 0 0 0 / 1 )',
                        titleFont: {
                            family: 'Poppins, sans-serif',
                            size: 13
                        },
                        bodyColor: 'rgba( 0 182 122 / 1 )',
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
                            padding: 12,
                            color: 'rgba( 0 0 0 / 1 )',
                            font: {
                                family: 'Poppins, sans-serif',
                                size: 14,
                                weight: 700
                            },
                            maxTicksLimit: 6,
                            beginAtZero: false,
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

    }

} );