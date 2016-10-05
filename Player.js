class Player {
    constructor(name, opponent, game) {
        this.name = name;
        this.side = false;
        this.remainingBalls = 'all';
        this.eightBallPocket = -1;
        this.getOpponent = () => MAIN.game.players[opponent];
        this.hasFoul = null;
        this.game = game;
    }
    addPoint(number, pocket, side) {
        if (number === 8 && this.remainingBalls.length > 0) {
            MAIN.msg(this.name + ' loser');
            alert('Loser');
        } else if (pocket === this.eightBallPocket) {
            MAIN.msg(this.name + ' winner');
            alert('Loser');
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
        }
        if (side === this.side) {
            if (this.hasFoul === null)
                this.hasFoul = false;
        } else {
            this.hasFoul = true;
        }
        document.getElementsByClassName('.b' + number)[0].style.display = 'none';
        this.remainingBalls = this.remainingBalls.filter((ballNumber) => ballNumber !== number);
        this.getOpponent().remainingBalls = this.remainingBalls.filter((ballNumber) => ballNumber !== number);
        this.eightBallPocket = (pocket + 3) % 6;
    }
}
