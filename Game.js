class Game {
    //TODO:
    //Power meter laten zien
    //Ballen goed laten vallen
    constructor(player1, player2) {
        this.players = [player1, player2];
        this.cheatLine = false;
        this.shootingEnabled = true;

        this.balls = [
            new Ball(0, -13.5 / 2),

            new Ball(0, 4 + 2.75, 0.3075, true, 1, false),

            new Ball(-0.32, 4.6 + 2.75, 0.3075, true, 3, false),
            new Ball(0.32, 4.6 + 2.75, 0.3075, true, 11, true),

            new Ball(0, 5.2 + 2.75, 0.3075, true, 8, false),
            new Ball(0.64, 5.2 + 2.75, 0.3075, true, 6, false),
            new Ball(-0.64, 5.2 + 2.75, 0.3075, true, 14, true),

            new Ball(0.32, 5.8 + 2.75, 0.3075, true, 15, true),
            new Ball(-0.32, 5.8 + 2.75, 0.3075, true, 4, false),
            new Ball(0.96, 5.8 + 2.75, 0.3075, true, 13, true),
            new Ball(-0.96, 5.8 + 2.75, 0.3075, true, 9, true),

            new Ball(0, 6.4 + 2.75, 0.3075, true, 10, true),
            new Ball(0.64, 6.4 + 2.75, 0.3075, true, 2, false),
            new Ball(-0.64, 6.4 + 2.75, 0.3075, true, 5, false),
            new Ball(1.28, 6.4 + 2.75, 0.3075, true, 7, false),
            new Ball(-1.28, 6.4 + 2.75, 0.3075, true, 12, true)
        ];
        this.balls[0].stoppedRolling = this.whiteStop;
        MAIN.scene.lights.spot.target = this.balls[0];
        let ballPos = this.balls[0].position;
        MAIN.scene.cue.position.set(ballPos.x, ballPos.y, ballPos.z);

        this.raycaster = new THREE.Raycaster();
        this.mousePos = new THREE.Vector2();

        this.highlighting = false;
        this.highlightedBall = null;
        this.selectedBall = this.balls[0];

        this.cuePower = 30;

        this.beurtElement = document.getElementById("beurt");
        this.players = [new Player(player1, 1), new Player(player2, 0)];
        this.currentPlayer = Math.random() > 0.5 ? 0 : 1;;
        this.beurtElement.innerText = this.players[this.currentPlayer].name;

        MAIN.msg(this.players[this.currentPlayer].name + ' starts the game');

        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        this.gameLoop = MAIN.loop.add(function() { MAIN.game.onLoop() });

        if (MAIN.isMobile) {
            this.cameraGyro = confirm('Enable gyroscopic camera movement?');
            window.addEventListener("deviceorientation", function(e) {
                MAIN.game.orientation(e);
            }, false);
            document.addEventListener('touchstart', function(e) {
                MAIN.game.tapLength = 0;
                MAIN.game.tapStart = new THREE.Vector2(e.touches[0].pageX, e.touches[0].pageY);
            }, false);
            document.addEventListener('touchmove', function(e) {
                let tap = new THREE.Vector2(e.touches[0].pageX, e.touches[0].pageY);

                if (MAIN.game.tapLength > 10) {
                    let horizontalLength = tap.x / window.innerWidth,
                        maxPower = 0.3075 * MAIN.loop.tps;
                    MAIN.game.cuePower = horizontalLength * maxPower;
                } else {
                    MAIN.game.tapLength = tap.distanceTo(MAIN.game.tapStart);
                }
            }, true);
            document.addEventListener('touchend', function(e) {
                console.log(MAIN.game.tapLength);
                if (MAIN.game.tapLength < 10) {
                    if (this.placeLoop)
                        this.placeLoop = MAIN.loop.remove(this.placeLoop);

                    MAIN.game.shoot();
                }
            }, false);
        } else {
            document.addEventListener('mousemove', function(e) {
                MAIN.game.mousemove(e);
            }, false);
            document.addEventListener('mousedown', function(e) {
                MAIN.game.mousedown(e);
            }, false);
            MAIN.keyHandler.setContinuousKey('ArrowLeft', function() {
                let rotateSpeed = 3 / MAIN.loop.tps;
                rotateSpeed /= MAIN.keyHandler.isPressed('Shift') ? 10 : 1;
                rotateSpeed /= MAIN.keyHandler.isPressed('Control') ? 5 : 1;
                MAIN.scene.cue.rotateY(rotateSpeed);
            });
            MAIN.keyHandler.setContinuousKey('ArrowRight', function() {
                let rotateSpeed = 3 / MAIN.loop.tps;
                rotateSpeed /= MAIN.keyHandler.isPressed('Shift') ? 10 : 1;
                rotateSpeed /= MAIN.keyHandler.isPressed('Control') ? 5 : 1;
                MAIN.scene.cue.rotateY(-rotateSpeed);
            });
            MAIN.keyHandler.setContinuousKey('ArrowUp', function() {
                let powerSpeed = 10 / MAIN.loop.tps;
                powerSpeed /= MAIN.keyHandler.isPressed('Shift') ? 5 : 1;
                powerSpeed /= MAIN.keyHandler.isPressed('Control') ? 5 : 1;
                MAIN.game.cuePower += powerSpeed;
                console.log('power', powerSpeed, MAIN.game.cuePower);
            });
            MAIN.keyHandler.setContinuousKey('ArrowDown', function() {
                let powerSpeed = 10 / MAIN.loop.tps;
                powerSpeed /= MAIN.keyHandler.isPressed('Shift') ? 5 : 1;
                powerSpeed /= MAIN.keyHandler.isPressed('Control') ? 5 : 1;
                MAIN.game.cuePower -= powerSpeed;
                console.log('power', powerSpeed, MAIN.game.cuePower);
            });
        }
        this.prevAngle = 0;
    }

    orientation(e) {
        let cueRotation = THREE.Math.degToRad(e.alpha);

        let quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), cueRotation);
        MAIN.scene.cue.setRotationFromQuaternion(quaternion);

        if (MAIN.game.cameraGyro) {
            let a = THREE.Math.degToRad(e.alpha),
                b = THREE.Math.degToRad(e.beta),
                c = THREE.Math.degToRad(e.gamma);

            quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

            quaternion.multiplyQuaternions(quaternion, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));

            quaternion.multiplyQuaternions(quaternion, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), b));

            quaternion.multiplyQuaternions(quaternion, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -c));

            quaternion.multiplyQuaternions(quaternion, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));
            MAIN.scene.camera.setRotationFromQuaternion(quaternion);
        } else {
            let a = THREE.Math.degToRad(-e.alpha);
            MAIN.scene.camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), this.prevAngle - a);
            this.prevAngle = a;
        }
    }

    get cuePower() {
        return this._cuePower;
    }
    set cuePower(p) {
        let maxPower = 0.3075 * MAIN.loop.tps;
        this._cuePower = p > maxPower ? maxPower : p;
        this._cuePower = this._cuePower < 0 ? 0 : this._cuePower;
        MAIN.style = `progress[value]::-webkit-progress-value{
            background-size: 35px 20px, ${maxPower/this._cuePower*100}% 100%, 100% 100% !important;
        }`;
        document.getElementsByTagName('progress')[0].setAttribute('value', this._cuePower / maxPower * 1000);
    }

    onLoop() {
        if (!MAIN.game.cameraGyro) {
            MAIN.scene.camera.position.x = this.balls[0].position.x;
            MAIN.scene.camera.position.z = this.balls[0].position.z;
        }
        for (let i = 0; i < this.balls.length; i++)
            for (let j = 0; j < this.balls.length; j++)
                if (i != j && this.balls[i].colliding(this.balls[j]))
                    this.balls[i].resolveCollision(this.balls[j]);

        if (this.cheatLine) {
            let rotation = MAIN.scene.cue.rotation.y;
            if (MAIN.scene.cue.rotation.x === Math.PI)
                rotation = Math.PI - rotation;
            if (MAIN.scene.cue.rotation.x < -1)
                rotation = Math.PI - rotation;
            else if (MAIN.scene.cue.rotation.y < 0)
                rotation = 2 * Math.PI + rotation;
            let x = Math.cos(rotation),
                z = Math.sin(rotation),
                direction = new THREE.Vector3(z, 0, x).normalize(),
                ray = new THREE.Raycaster(MAIN.scene.cue.position);
            ray.ray.direction = direction;
            let intersectables = this.balls.slice();
            intersectables.push(MAIN.scene.tableWallMesh);
            let wallHits = ray.intersectObjects(intersectables);
            if (wallHits.length > 0) {
                let lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(
                    MAIN.scene.cue.position,
                    wallHits[0].point
                )
                let line = new THREE.Line(lineGeometry, this.lineMaterial);
                MAIN.scene.children = MAIN.scene.children.filter((child) => child.type !== 'Line');
                MAIN.scene.add(line);
            }
        }

        this.raycaster.setFromCamera(this.mousePos, MAIN.scene.camera);
        let intersects = this.raycaster.intersectObjects(this.balls).map(i => i.object);

        if (this.highlighting || intersects.length !== 0) {
            let highLighter = false;
            this.highlightedBall = null;
            for (let i = 0; i < this.balls.length; i++) {
                let index = intersects.indexOf(this.balls[i]);
                if (index === -1) {
                    //this.balls[i].material.color.set(0xffffff);
                } else {
                    this.highlightedBall = this.balls[i];
                    //this.balls[i].material.color.set(0xff00ff);
                    highLighter = true;
                }
            }
            this.highlighting = highLighter;
        }
    }

    score(number, pocket, stripe) {
        if (number === 0) {
            this.freePlace(this.balls.filter((ball) => ball.number === 0)[0]);
            this.switchPlayers();
        } else {
            this.players[this.currentPlayer].addPoint(number, pocket, stripe ? 'stripe' : 'full');
        }
    }

    shoot() {
        if (this.shootingEnabled) {
            this.shootingEnabled = false;
            let origPos = new THREE.Vector3(0, 0.9, -8.5),
                backPos = origPos.clone(),
                frontPos = origPos.clone(),
                power = this.cuePower / MAIN.loop.tps;
            backPos.z -= power * 5;
            frontPos.z += 1.8;

            let that = this;
            MAIN.scene.animateObject(MAIN.scene.cue.children[0], backPos, 500);
            self.setTimeout(function() {
                let slowTween = MAIN.scene.animateObject(MAIN.scene.cue.children[0], frontPos, 60 / power);
                self.setTimeout(function() {

                    let rotation = MAIN.scene.cue.rotation.y;
                    if (MAIN.scene.cue.rotation.x === Math.PI)
                        rotation = Math.PI - rotation;
                    if (MAIN.scene.cue.rotation.x < -1)
                        rotation = Math.PI - rotation;
                    else if (MAIN.scene.cue.rotation.y < 0)
                        rotation = 2 * Math.PI + rotation;
                    let x = Math.cos(rotation),
                        z = Math.sin(rotation),
                        speed = new THREE.Vector3(z, 0, x).multiplyScalar(power);

                    that.selectedBall.setSpeed(speed);

                    self.setTimeout(function() {
                        slowTween.stop();
                        MAIN.scene.animateObject(MAIN.scene.cue.children[0], origPos, 500);
                    }, 200);

                }, 60 / power / 1.9);
            }, 500);
        }
    }

    whiteStop() {
        MAIN.game.shootingEnabled = true;
        MAIN.scene.animateObject(MAIN.scene.cue, this.position, 1000);
        //check fouls
        let foul = MAIN.game.players[MAIN.game.currentPlayer].hasFoul;
        console.log('white stop foul; ', foul);
        if (foul === true || foul === undefined)
            MAIN.game.switchPlayers();

        for (let player of MAIN.game.players)
            delete player.hasFoul;
    }

    switchPlayers() {
        console.log('players switched');
        this.currentPlayer = (this.currentPlayer + 1) % 2;
        this.beurtElement.innerText = this.players[this.currentPlayer].name;
        MAIN.msg('foul! ' + this.players[this.currentPlayer].name + "'s turn");
    }

    saveImage(url, fileName) {
        let a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);

        a.href = url;
        a.download = fileName;
        a.click();
    }

    getWinnerImage(text) {
        let winnerImg = document.getElementById('img'),
            canvasElement = document.createElement('canvas'),
            context = canvasElement.getContext('2d');
        canvasElement.setAttribute("id", "winnerCanvas");

        canvasElement.width = winnerImg.width;
        canvasElement.height = winnerImg.height;

        context.drawImage(winnerImg, 0, 0, 625, 913);

        context.fillStyle = '#aaa';
        context.font = "30px 'Press Start 2P'";
        let textSize = context.measureText(text).width;

        if (textSize > 290) {
            let startText = text.substring(0, Math.round(text.length / 2)),
                endText = text.substring(startText.length);

            let textSize = context.measureText(startText).width,
                x = winnerImg.width / 2 - textSize / 2;
            context.fillText(startText, x, 590);

            textSize = context.measureText(endText).width;
            x = winnerImg.width / 2 - textSize / 2;
            context.fillText(endText, x, 630);
        } else {
            let x = winnerImg.width / 2 - textSize / 2;
            context.fillText(text, x, 610);
        }
        return new Promise(function(resolve) {
            canvasElement.toBlob(function(b) {
                resolve(URL.createObjectURL(b));
            });
        });
    }

    linePlace(ball, line = -6.75) {
        let that = this;
        this.placeLoop = MAIN.loop.add(function() {
            that.raycaster.setFromCamera(that.mousePos, MAIN.scene.camera);
            let intersects = that.raycaster.intersectObjects([MAIN.scene.tableFloor.mesh]);

            if (intersects.length !== 0) {
                that.placeLocation = intersects[0].point;
                let p = that.placeLocation;
                if (p.x <= Game.tableSize.x / 2 - 0.05 - ball.radius && p.x >= -Game.tableSize.x / 2 + 0.05 + ball.radius)
                    if (!that.collidingAny(new THREE.Vector3(p.x, ball.radius, p.z), ball))
                        ball.position.set(p.x, ball.radius, line);
            }
        });
    }

    freePlace(ball) {
        ball.speed.set(0, 0, 0);
        ball.ballLoop = MAIN.loop.remove(ball.ballLoop);
        let that = this;
        this.placeLoop = MAIN.loop.add(function() {
            that.raycaster.setFromCamera(that.mousePos, MAIN.scene.camera);
            let intersects = that.raycaster.intersectObjects([MAIN.scene.tableFloor.mesh]);

            if (intersects.length !== 0) {
                that.placeLocation = intersects[0].point;
                let p = that.placeLocation;
                if (p.x <= Game.tableSize.x / 2 - 0.05 - ball.radius && p.x >= -Game.tableSize.x / 2 + 0.05 + ball.radius)
                    if (p.z <= Game.tableSize.z / 2 - 0.05 - ball.radius && p.z >= -Game.tableSize.z / 2 + 0.05 + ball.radius)
                        if (!that.collidingAny(new THREE.Vector3(p.x, ball.radius, p.z), ball))
                            ball.position.set(p.x, ball.radius, p.z);
            }
        });
    }

    collidingAny(pos, excludedBall) {
        let balls = this.balls.filter((ball) => ball !== excludedBall);
        for (let ball of balls)
            if (pos.distanceTo(ball.position) < ball.radius + excludedBall.radius)
                return true;
        return false;
    }

    mousedown(e) {
        if (this.placeLoop)
            this.placeLoop = MAIN.loop.remove(this.placeLoop);

        if (this.highlightedBall) {
            MAIN.scene.animateObject(MAIN.scene.cue, this.highlightedBall.position, 500);
            this.selectedBall = this.highlightedBall;
            if (e.ctrlKey) {
                console.log(this.selectedBall.number);
                this.freePlace(this.selectedBall);
            }
        }
    }

    mousemove(e) {
        this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    static get tableSize() {
        return {
            z: 27,
            x: 13.5
        }
    }
    static get balls() {
        return {
            stripe: [9, 10, 11, 12, 13, 14, 15],
            full: [1, 2, 3, 4, 5, 6, 7]
        }
    }
}
