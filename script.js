$(document).ready(function() {
    game = new Game(document.getElementById('renderView'));
    self.setTimeout(function() {
        //game.balls[1].setSpeed(new THREE.Vector3(0, 0, -0.1));
    }, 1000);

    for(let i=0;i<15;i++){

    }
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

function newPlayer() {
    let name1 = prompt('Player 1 name?', 'Player 1'),
        name2 = prompt('Player 2 name?', 'Player 2');
}
