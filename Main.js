class Main {
    constructor(renderElement) {
        this.loop = new GameLoop(120);
        this.keyHandler = new KeyHandler(this.loop);
        this.scene = new Scene(renderElement, this);

        this.setKeymap();
    }

    startGame(player1, player2) {
        this.game = new Game(player1, player2);
    }

    setKeymap() {
        let main = this;
        this.keyHandler.setSingleKey(' ', function() {
            main.game.shoot();
        });
        this.keyHandler.setSingleKey('5', function() {
            main.scene.topView();
        });
        this.keyHandler.setSingleKey('6', function() {
            main.scene.eastView();
        });
        this.keyHandler.setSingleKey('4', function() {
            main.scene.westView();
        });
        this.keyHandler.setSingleKey('2', function() {
            main.scene.southView();
        });
        this.keyHandler.setSingleKey('8', function() {
            main.scene.northView();
        });
        this.keyHandler.setSingleKey('c', function() {
            main.scene.children = main.scene.children.filter((child) => child.type !== 'Line');
            main.game.cheatLine = !main.game.cheatLine;
        });
    }

    msg(string) {
        let msgBox = document.getElementById('messageBox');
        msgBox.innerHTML = string;
        msgBox.style.transform = 'translateY(0px)';

        if (this.msgTimeout)
            clearTimeout(this.msgTimeout);
        this.msgTimeout = self.setTimeout(function() {
            msgBox.style.transform = 'translateY(100px)';
        }, 3000 + string.length * 100);
    }
}
