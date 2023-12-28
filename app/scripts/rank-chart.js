document.addEventListener( 'DOMContentLoaded', function () {

    /**
     * get chart context
     */

    let __chart_rank = document.getElementById( '__chart_rank' );

    if( __chart_rank ) {

        /**
         * process chart data
         */

        let __chart_rank_data = [];

        __chart_rank_data.push( _history[0] );

        for( let i = 1; i < _history.length - 1; i += Math.round( _history.length / 400 ) ) {

            __chart_rank_data.push( _history[ i ] );

        }

        __chart_rank_data.push( _history[ _history.length - 1 ] );

        /**
         * create new chart
         */

        new Chart( __chart_rank.getContext( '2d' ), {
            type: 'line',
            data: {
                labels: __chart_rank_data.map( r => r[0].replaceAll( '-', '/' ) ),
                datasets: [ {
                    data: __chart_rank_data.map( r => r[1] ),
                    pointHitRadius: 50,
                    pointStyle: false,
                    lineTension: 0.1,
                    borderWidth: 3,
                    borderColor: 'rgba( 227 11 92 / 1 )'
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
                        borderColor: 'rgba( 227 11 92 / 1 )',
                        cornerRadius: 4,
                        titleColor: 'rgba( 0 0 0 / 1 )',
                        titleFont: {
                            family: 'Poppins, sans-serif',
                            size: 13
                        },
                        bodyColor: 'rgba( 227 11 92 / 1 )',
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

                                if( value > 0 && parseInt( value ) == parseFloat( value.toFixed( 1 ) ) ) {

                                    return '#' + parseInt( value );

                                }

                            }
                        }
                    }
                }
            }
        } );

    }

} );