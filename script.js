$(document).ready(function() {
    game = new Game(document.getElementById('renderView'));
});


function time(fun, trials = 10000000) {
    let now = performance.now();
    for (let i = 0; i < trials; i++) {
        fun();
    }
    let time = (performance.now() - now) / trials,
        unit = 'milliseconds';
    if (time < 1) {
        time *= 1000;
        unit = 'microseconds';
    }
    if (time < 1) {
        time *= 1000;
        unit = 'nanoseconds';
    }
    console.log('average: ', time, unit);
}