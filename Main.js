class Main {
    constructor(renderElement) {
        let isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };
        this.isMobile = isMobile.any();

        this.loop = new GameLoop(this.isMobile ? 60 : 120);
        this.keyHandler = new KeyHandler(this.loop);
        this.scene = new Scene(renderElement, this);

        this.styleElement = document.body.appendChild(document.createElement('style'));

        this.katMaterial = new MeshAnimationMaterial({
            directory: 'img/textures/kat',
            side: THREE.FrontSide
        });
        this.setKeymap();
    }

    set style(string) {
        this.styleElement.innerHTML = string;
    }
    get style() {
        return this.styleElement.innerHTML;
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
        this.keyHandler.setSingleKey('s', function() {
            main.scene.toggleStats();
        });
        this.keyHandler.setSingleKey('o', function() {
            clearInterval(MAIN.loop.gameloop);
            MAIN.loop.loop();
        });
        this.keyHandler.setSingleKey('p', function() {
            MAIN.loop.start();
        });
        this.keyHandler.setSingleKey('c', function() {
            main.scene.children = main.scene.children.filter((child) => child.type !== 'Line');
            main.game.cheatLine = !main.game.cheatLine;
        });
        this.keyHandler.setSingleKey('w', function() {
            main.game.freePlace(main.game.balls.filter((ball) => ball.number === 0)[0]);
        });

        document.addEventListener('keydown', function(e) {
            if (this.katKeys === undefined) {
                this.katKeys = '';
            }
            this.katKeys += e.key;
            if (this.katKeys.includes('kat.gif')) {
                this.katKeys = '';
                for (let ball of MAIN.game.balls) {
                    ball.material = MAIN.katMaterial;
                }
                MAIN.scene.tableFloor.mesh.material = MAIN.katMaterial;
                MAIN.katMaterial.toggle();
            }
        }, false);
    }


    msg(string) {
        let msgBox = document.getElementById('messageBox'),
            progressBar = document.getElementsByTagName('progress')[0],
            cameraButton = document.getElementById('cameraButton');
        msgBox.innerHTML = string;
        msgBox.style.transform = 'translateY(0px)';
        progressBar.style.transform = 'translateY(-60px)';
        cameraButton.style.transform = 'translateY(-60px)';

        if (this.msgTimeout)
            clearTimeout(this.msgTimeout);
        this.msgTimeout = self.setTimeout(function() {
            msgBox.style.transform = 'translateY(60px)';
            progressBar.style.transform = 'translateY(0px)';
            cameraButton.style.transform = 'translateY(0px)';
        }, 3000 + string.length * 100);
    }
}
