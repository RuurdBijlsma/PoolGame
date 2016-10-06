class Player {
    constructor(name, opponent) {
        this.name = name;
        this.side = false;
        this.remainingBalls = 'all';
        this.eightBallPocket = -1;
        this.getOpponent = () => MAIN.game.players[opponent];
        this.hasFoul = undefined;
    }
    addPoint(number, pocket, side) {
        if (number === 8 && (this.remainingBalls.length > 0 || pocket !== this.eightBallPocket)) {
            console.log('1', number, this.remainingBalls, pocket, this.eightBallPocket);
            this.getOpponent().win();
        } else if (pocket === this.eightBallPocket && number==8 && this.remainingBalls.length === 0) {
            console.log('2', number, this.remainingBalls, pocket, this.eightBallPocket);
            this.win();
        }
        if (!this.side) {
            for (let side in Game.balls)
                for (let ball of Game.balls[side]) {
                    document.getElementsByClassName('b' + ball)[0].style.display = 'inline-block';
                    if (ball === number) {
                        this.side = side;
                        this.getOpponent().side = side === 'stripe' ? 'full' : 'stripe';
                    }
                }
            document.querySelector('#' + this.side + 'Balls .name').innerHTML = this.name;
            document.querySelector('#' + this.getOpponent().side + 'Balls .name').innerHTML = this.getOpponent().name;
            this.remainingBalls = Game.balls[this.side];
            this.getOpponent().remainingBalls = Game.balls[this.getOpponent().side];
        }
        if (side === this.side) {
            if (this.hasFoul === undefined) {
                this.hasFoul = false;
            }
        } else {
            this.hasFoul = true;
        }
        document.getElementsByClassName('b' + number)[0].style.display = 'none';
        this.remainingBalls = this.remainingBalls.filter((ballNumber) => ballNumber !== number);

        this.getOpponent().remainingBalls = this.getOpponent().remainingBalls.filter((ballNumber) => ballNumber !== number);
        this.eightBallPocket = (pocket + 3) % 6;
    }

    win() {
        MAIN.msg(this.name + ' winner');

        let winnerElement = document.getElementById('imwinner');
        winnerElement.style.transform = 'scale(0.8)';
        winnerElement.style.opacity = 1;

        let player = this;
        MAIN.game.getWinnerImage(this.name).then(function(url) {
            winnerElement.style.backgroundImage = 'url(' + url + ')';
            setTimeout(function() {
                if (confirm('Print your achievement?')) {
                    window.open(url).print();
                    MAIN.game.saveImage(url, player.name);
                }
            }, 300);
        });
    }
}
