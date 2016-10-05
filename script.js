document.addEventListener('DOMContentLoaded', init, false);

function init() {
    MAIN = new Main(document.getElementById('renderView'));

    newGame('Ruurd', 'Bijlsma');
    self.setTimeout(function(){
        let name = prompt('Your name?');
        MAIN.game.getWinnerImage(name).then(function(t){
            console.log(t);
            MAIN.game.saveImage(t, name);
        });
    }, 500);
}

function newGame(n1, n2) {
    let name1 = n1 || prompt('Player 1 name?', 'Player 1'),
        name2 = n2 || prompt('Player 2 name?', 'Player 2');
    MAIN.startGame(name1, name2);

    let menu = document.getElementById('menu'),
        gameHider = document.getElementById('gameHider');
    players = document.getElementById('players');
    setTimeout(function() {
        gameHider.style.opacity = 0;
        gameHider.style.backgroundColor = 'transparent';
        gameHider.style.pointerEvents = 'none';
        players.style.transform = 'scale(1) translateY(0px)';
    }, 500);
    setTimeout(function() {
        menu.style.width = '50%';
        menu.style.transform = 'translateX(-100%)';
        menu.style.pointerEvents = 'none';
        menu.style.opacity = 0;
    }, 1000);
}

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
