'use script';

var bar, _time, _step = 0;

const colors = require( 'ansi-colors' );
const cliProgress = require( 'cli-progress' );

/**
 * start new step (with progress bar)
 * @param {String} step name of step
 * @param {Int} total total number of steps
 * @param {String} chunks
 * @param {Int} start start position (bar)
 */
const nextStep = ( step, total, chunks = '', start = 0 ) => {

    if( bar != null ) {

        finishStep();

    }

    _time = ( new Date() ).getTime();
    _step++;

    console.log( step );

    bar = new cliProgress.SingleBar( {
        format: '{bar} | ' + colors.yellow( 'ETA: {eta}s' ) + ' | {value} of {total} ' + chunks
    }, cliProgress.Presets.rect );

    bar.start( total, start );

};

/**
 * update current step
 */
const updateStep = () => {

    bar.increment();

};

/**
 * finish current step
 */
const finishStep = () => {

    bar.stop();

    bar = null;

    console.log( colors.green( 'step ' + _step + ' finished after ' + (
        ( ( new Date() ).getTime() - _time ) / 1000
    ).toFixed( 3 ) + 's' ) );

    console.log( '' );

};

/**
 * export module functions
 */
module.exports = {
    nextStep,
    updateStep,
    finishStep,
    bar
};