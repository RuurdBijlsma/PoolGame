class GameLoop {
    constructor(tps) {
        this.tps = tps;
        this.functions = {
            0: function() {}
        };
        this.amount = 1;
        let gameLoop = this;
        this.gameloop = self.setInterval(function() {
            gameLoop.loop(gameLoop);
        }, 1000 / tps);
    }
    add(fun) {
        this.functions[this.amount] = fun;
        return this.amount++;
    }
    remove(funIndex) {
        delete this.functions[funIndex];
        return false;
    }
    loop(gameLoop) {
        for (let funKey in gameLoop.functions)
            gameLoop.functions[funKey]();
    }
}
