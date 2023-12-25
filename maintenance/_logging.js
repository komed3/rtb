'use script';

var bar, _total, _progress, _time, _step = 0;

const colors = require( 'ansi-colors' );
const cliProgress = require( 'cli-progress' );

/**
 * start new step (with progress bar)
 * @param {String} step name of step
 * @param {Int} total total number of steps
 * @param {String} chunks
 * @param {Int} start start position (bar)
 */
const next = ( step, total, chunks = '', start = 0 ) => {

    if( bar != null ) {

        finish();

    }

    _total = total;
    _progress = start;
    _time = ( new Date() ).getTime();
    _step++;

    console.log( step );

    bar = new cliProgress.SingleBar( {
        format: '{bar} | ' + colors.yellow( 'ETA: {eta}s' ) + ' | {value} of {total} ' + chunks,
        autopadding: true,
        etaBuffer: 30
    }, cliProgress.Presets.rect );

    bar.start( _total, _progress );

};

/**
 * update current step
 * @param {Int} increment progress
 */
const update = ( increment = 1 ) => {

    if( bar != null ) {

        _progress += increment;

        bar.update( _progress );

    }

};

/**
 * add steps to total
 * @param {Int} increment steps to add
 */
const addTotal = ( increment = 1 ) => {

    if( bar != null ) {

        _total+= increment;

        bar.setTotal( _total );

    }

};

/**
 * finish current step
 */
const finish = () => {

    if( bar != null ) {

        abort();

        console.log( colors.green( 'step ' + _step + ' finished after ' + (
            ( ( new Date() ).getTime() - _time ) / 1000
        ).toFixed( 3 ) + 's' ) );

        console.log( '' );

    }

};

/**
 * abort (active) progress bar instance
 */
const abort = () => {

    if( bar != null ) {

        bar.stop();

        bar = null;

    }

};

/**
 * export module functions
 */
module.exports = {
    next,
    update,
    addTotal,
    finish,
    abort
};