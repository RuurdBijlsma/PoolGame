class Player{
    constructor(name, opponent, game){
        this.name = name;
        this.side = false;
        this.remainingBalls = 'all';
        this.eightBallPocket = -1;
        this.getOpponent = () => game.players[opponent];
    }
    addPoint(number, pocket){
        if(number===8 && this.remainingBalls.length>0){
            alert(this.name + ' loser');
        }else if(pocket === this.eightBallPocket){
            alert(this.name + ' winner');
        }
        if(!this.side){
            for(let side in Game.balls)
                for(let ball of Game.balls[side]){
                    $('.b'+ball).css('display','inline-block');
                    if(ball === number){
                        this.side = side;
                        this.getOpponent().side = side==='stripe'?'full':'stripe';
                    }
                }
            $('#'+this.side+'Balls .name').text(this.name);
            $('#'+this.getOpponent().side+'Balls .name').text(this.getOpponent().name);
            this.remainingBalls = Game.balls[this.side];
        }
        $('.b'+number).css('display','none');
        this.remainingBalls = this.remainingBalls.filter((ballNumber)=>ballNumber!==number);
        this.getOpponent().remainingBalls = this.remainingBalls.filter((ballNumber)=>ballNumber!==number);
        this.eightBallPocket=(pocket + 3)%6;
    }
}