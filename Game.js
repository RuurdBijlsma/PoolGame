//TODO
//Gaten mooier maken DONE
//Rest van tafel maken DONE
//Physics
//Keu animatie bij shieten DONE
//Schieten fixen (hoek soms) DONE
//Niet schieten mogelijk als de keu er niet is DONE
//Alle ballen toevoegen DONE
//Scoren toevoegen DONE
//Regels toevoegen
//Bij wall collision minder zwaar de ball position terug zetten als hij glitchet DONE

//players toevoegen
    //players beginnen zonder side
    //nadat de eerste legale bal is gepocket krijgt die player de streep of niet streep side
    //https://www.wikiwand.com/en/Eight-ball#/Standardized_rules_of_play
class Game {
    static get tps() {
        return 120;
    }
    static get tableSize() {
        return {
            z: 27,
            x: 13.5
        }
    }
    static get ballColors() {
        return {
            0: '#ffffff',
            1: '#ffff00',
            3: '#ff0100',
            11: '#ff0100',
            8: '#000000',
            6: '#004008',
            14: '#004008',
            15: '#cc0000',
            4: '#240044',
            13: '#ff2200',
            9: '#ffff00',
            10: '#073fe4',
            2: '#073fe4',
            5: '#ff2200',
            7: '#cc0000',
            12: '#240044'
        }
    }
    constructor(renderElement) {
        this.cheatLine = false;
        if(localStorage.getItem('laptop')===null)
            localStorage['laptop'] = !confirm('Enable high graphics?');
        this.laptopGraphics = localStorage['laptop'] === 'true';
        this.scene = new THREE.Scene();
        // this.scene.fog = new THREE.FogExp2(0x050423, 0.002);

        this.renderElement = $(renderElement);
        this.camera = new THREE.PerspectiveCamera(45, this.renderElement.width() / this.renderElement.height(), 0.1, 10000);
        this.camera.position.x = 19.478757450139764;
        this.camera.position.y = 13.112708652062874;
        this.camera.position.z = -21.18250850069678;
        this.camera.rotation._x = -2.4532338955548085;
        this.camera.rotation._y = 0.6979107790638375;
        this.camera.rotation._z = 2.6553234469537466;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.shadowMap.enabled = true;
        if (this.laptopGraphics)
            this.renderer.shadowMap.type = THREE.BasicShadowMap;
        else
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.renderElement.width(), this.renderElement.height());

        this.renderElement.append(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, renderElement);

        this.balls = [
            new Ball(this,0, -13.5 / 2),

            new Ball(this, 0, 4 + 2.75, 0.3075, true, 1, false),

            new Ball(this, -0.32, 4.6 + 2.75, 0.3075, true, 3, false),
            new Ball(this, 0.32, 4.6 + 2.75, 0.3075, true, 11, true),

            new Ball(this, 0, 5.2 + 2.75, 0.3075, true, 8, false),
            new Ball(this, 0.64, 5.2 + 2.75, 0.3075, true, 6, false),
            new Ball(this, -0.64, 5.2 + 2.75, 0.3075, true, 14, true),

            new Ball(this, 0.32, 5.8 + 2.75, 0.3075, true, 15, true),
            new Ball(this, -0.32, 5.8 + 2.75, 0.3075, true, 4, false),
            new Ball(this, 0.96, 5.8 + 2.75, 0.3075, true, 13, true),
            new Ball(this, -0.96, 5.8 + 2.75, 0.3075, true, 9, true),

            new Ball(this, 0, 6.4 + 2.75, 0.3075, true, 10, true),
            new Ball(this, 0.64, 6.4 + 2.75, 0.3075, true, 2, false),
            new Ball(this, -0.64, 6.4 + 2.75, 0.3075, true, 5, false),
            new Ball(this, 1.28, 6.4 + 2.75, 0.3075, true, 7, false),
            new Ball(this, -1.28, 6.4 + 2.75, 0.3075, true, 12, true)
        ];
        this.balls[0].stoppedRolling = this.whiteStop;

        this.lights = {
            spot: new SpotLight(this.scene, 0, 5, 20, this.balls[0]),
            directional: new DirectionalLight(this.scene, -10, 30, 30, null, true, 0xffffff, 0.6),
            ambient: new AmbientLight(this.scene, 0xffffdd, 0.1)
        };

        this.wallShapes = [
            this.pointsToShape(
                new THREE.Vector2(6, -13.85),
                new THREE.Vector2(-6, -13.85),
                new THREE.Vector2(-5.625, -13.5),
                new THREE.Vector2(5.625, -13.5)
            ),
            this.pointsToShape(
                new THREE.Vector2(-6, 13.85),
                new THREE.Vector2(-5.625, 13.5),
                new THREE.Vector2(5.625, 13.5),
                new THREE.Vector2(6, 13.85)
            ),
            this.pointsToShape(
                new THREE.Vector2(7.1, 12.75),
                new THREE.Vector2(6.75, 12.5),
                new THREE.Vector2(6.75, 0.75),
                new THREE.Vector2(7.1, 0.7)
            ),
            this.pointsToShape(
                new THREE.Vector2(7.1, -12.75),
                new THREE.Vector2(7.1, -0.7),
                new THREE.Vector2(6.75, -0.75),
                new THREE.Vector2(6.75, -12.5)
            ),
            this.pointsToShape(
                new THREE.Vector2(-7.1, -12.75),
                new THREE.Vector2(-6.75, -12.5),
                new THREE.Vector2(-6.75, -0.75),
                new THREE.Vector2(-7.1, -0.7)
            ),
            this.pointsToShape(
                new THREE.Vector2(-7.1, 12.75),
                new THREE.Vector2(-7.1, 0.7),
                new THREE.Vector2(-6.75, 0.75),
                new THREE.Vector2(-6.75, 12.5)
            )
        ];
        let floorShape = this.pointsToShape(
            new THREE.Vector2(-6, -13.85),
            new THREE.Vector2(-6.375, -13.125),
            new THREE.Vector2(-7.1, -12.75),
            new THREE.Vector2(-7.1, -0.7),
            new THREE.Vector2(-6.695, 0),
            new THREE.Vector2(-7.1, 0.7),
            new THREE.Vector2(-7.1, 12.75),
            new THREE.Vector2(-6.375, 13.125),
            new THREE.Vector2(-6, 13.85),
            new THREE.Vector2(6, 13.85),
            new THREE.Vector2(6.375, 13.125),
            new THREE.Vector2(7.1, 12.75),
            new THREE.Vector2(7.1, 0.7),
            new THREE.Vector2(6.695, 0),
            new THREE.Vector2(7.1, -0.7),
            new THREE.Vector2(7.1, -12.75),
            new THREE.Vector2(6.375, -13.125),
            new THREE.Vector2(6, -13.85)
        );

        let floorTextureLoader = new THREE.TextureLoader(),
            clothMap = floorTextureLoader.load('img/cloth.jpg'),
            clothMaterial = new THREE.MeshStandardMaterial(
                this.laptopGraphics ? {
                map: clothMap
            } : {
                map: clothMap,
                bumpScale: 0.01,
                bumpMap: clothMap
            });
        clothMap.repeat.set(0.15, 0.15);
        clothMap.wrapS = clothMap.wrapT = THREE.RepeatWrapping;

        this.wallMesh = this.shapesToMesh(this.wallShapes, .5, clothMaterial);
        this.wallMesh.rotateX(Math.PI / 2);
        this.wallMesh.receiveShadow = true;
        this.wallMesh.castShadow = true;
        this.wallMesh.position.y = .5;
        this.scene.add(this.wallMesh);

        this.floor = new ObjMesh(this.scene, 'obj/table/floor.obj', 'img/cloth.jpg', 2, false, true, !this.laptopGraphics);
        this.tableBase = new ObjMesh(this.scene, 'obj/table/woodwalls.obj', 'img/wood.jpg',10, true, true, !this.laptopGraphics);
        this.tableLegs = new ObjMesh(this.scene, 'obj/table/legs.obj', 'img/wood.jpg',10, true, true, !this.laptopGraphics);

        let keuGeometry = new THREE.CylinderGeometry(0.06, 0.1, 15, 32, 32),
            keuMaterial = new THREE.MeshStandardMaterial({ color: 0xfda43a });

        let keuMesh = new THREE.Mesh(keuGeometry, keuMaterial);
        keuMesh.position.y = 0.9;
        keuMesh.rotateX(Math.PI / 2);
        keuMesh.position.z -= 8.5;
        keuMesh.rotateX(0.1);
        keuMesh.castShadow = true;
        this.keu = new THREE.Group();
        this.keu.add(keuMesh);
        this.scene.add(this.keu);
        let pos = this.balls[0].position;
        this.keu.position.set(pos.x, pos.y, pos.z);

        let floorGeometry = new THREE.PlaneGeometry(70, 150, 0, 0),
            floorMap = new THREE.TextureLoader().load('img/floorwood.jpg'),
            floorMaterial = new THREE.MeshPhongMaterial(this.laptopGraphics?{
                map: floorMap
            }:{
                map: floorMap,
                bumpMap: floorMap,
                bumpScale: 0.1
            });
        floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
        floorMap.repeat.set(15, 15);

        this.groundMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        this.groundMesh.rotateX(-Math.PI/2);
        this.groundMesh.position.y = -7.788;
        this.groundMesh.receiveShadow=true;
        this.scene.add(this.groundMesh);



        // let hdriLoader = new THREE.TextureLoader(),
        //     hdriMap = hdriLoader.load('img/hdri4.jpg'),
        //     hdriMaterial = new THREE.MeshBasicMaterial({
        //         map: hdriMap,
        //         side: 1
        //     }),
        //     skyGeometry = new THREE.SphereGeometry(1000, 40, 40);
        // this.sky = new THREE.Mesh(skyGeometry, hdriMaterial);
        // this.scene.add(this.sky);



        this.render(this);
        let that = this;
        this.keyPressed = [];
        $(document).keydown(function(e) {
            that.keydown(e, that);
        });
        $(document).keyup(function(e) {
            that.keyup(e, that);
        });

        this.loopFunctions = {
            0: function() {}
        };
        this.loopAmount = 1;
        this.gameloop = self.setInterval(function() {
            that.loop(that);
        }, 1000 / Game.tps);

        this.raycaster = new THREE.Raycaster();
        this.mousePos = new THREE.Vector2();

        $(document).mousemove(function(e) {
            that.mousemove(e, that);
        });
        $(document).mousedown(function(e) {
            that.mousedown(e, that);
        });
        $(window).resize(function() {
            that.onWindowResize(that);
        });

        this.highlighting = false;
        this.highlightedBall = null;
        this.selectedBall = that.balls[0];
        this.power = 30;


        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });


        this.skyBox = new SkyBox(this, 'img/spacebox/');
    }

    score(number, stripe, scorePocket) {
        if (number === 0)
            this.freePlace(this.balls.filter((ball)=>ball.number===0)[0]);
        else
            console.log(`ball ${number} scored a point for ${stripe?'streep':'niet-streep'} in pocket ${scorePocket}`);
    }

    pointsToShape(...points) {
        points.reverse();
        return new THREE.Shape(points);
    }

    shapesToMesh(shapes, depth, material = new THREE.MeshStandardMaterial({ color: 0xffffff })) {
        let extrudeSettings = {
                bevelEnabled: true,
                bevelSize: 0.05,
                bevelThickness: 0.05,
                steps: 1,
                amount: depth
            },
            geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings),
            mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 2, 0);
        return mesh;
    }

    onWindowResize(that) {
        that.camera.aspect = that.renderElement.width() / that.renderElement.height();
        that.renderer.setSize(that.renderElement.width(), that.renderElement.height());
        that.camera.updateProjectionMatrix();
    }

    shoot() {
        let origPos = new THREE.Vector3(0, 0.9, -8.5),
            backPos = origPos.clone(),
            frontPos = origPos.clone(),
            power = this.power / Game.tps;
        backPos.z -= power * 5;
        frontPos.z += 1.8;

        let that = this;
        this.animateObject(this.keu.children[0], backPos, 500);
        self.setTimeout(function() {
            console.log('duration: ',30 / power);
            let slowTween = that.animateObject(that.keu.children[0], frontPos, 60 / power);
            self.setTimeout(function() {

                let rotation = that.keu.rotation.y;
                if (that.keu.rotation.x === Math.PI)
                    rotation = Math.PI - rotation;
                if (that.keu.rotation.x < -1)
                    rotation = Math.PI - rotation;
                else if (that.keu.rotation.y < 0)
                    rotation = 2 * Math.PI + rotation;
                let x = Math.cos(rotation),
                    z = Math.sin(rotation),
                    speed = new THREE.Vector3(z, 0, x).multiplyScalar(power);

                that.selectedBall.setSpeed(speed);

                self.setTimeout(function(){
                    slowTween.stop();
                    that.animateObject(that.keu.children[0], origPos, 500);
                }, 200);

            }, 60 / power / 1.9);
        }, 500);
    }

    mousedown(e, that) {
        if(that.placeLoop){
            that.placeLoop=that.removeLoop(that.placeLoop);
        }

        if (that.highlightedBall) {
            that.animateObject(that.keu, that.highlightedBall.position, 500);
            that.selectedBall = that.highlightedBall;
            if(e.ctrlKey){
                console.log(that.selectedBall.number);
                that.freePlace(that.selectedBall);
            }
        }
    }

    mousemove(e, that) {
        that.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
        that.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    addLoop(fun) {
        this.loopFunctions[this.loopAmount] = fun;
        return this.loopAmount++;
    }
    removeLoop(funIndex) {
        delete this.loopFunctions[funIndex];
        return false;
    }

    whiteStop(game) {
        game.animateObject(game.keu, this.position, 1000);
    }

    linePlace(ball, line = -6.75){
        let that = this;
        this.placeLoop = that.addLoop(function(){
            that.raycaster.setFromCamera(that.mousePos, that.camera);
            let intersects = that.raycaster.intersectObjects([that.floor.mesh]);

            if (intersects.length !== 0) {
                that.placeLocation = intersects[0].point;
                let p = that.placeLocation;
                if(p.x <= Game.tableSize.x/2-0.05 - ball.radius && p.x >= -Game.tableSize.x/2+0.05 + ball.radius)
                    if(!that.collidingAny(new THREE.Vector3(p.x, ball.radius, p.z), ball))
                        ball.position.set(p.x, ball.radius, line);
            }
        });
    }

    freePlace(ball){
        ball.speed.set(0,0,0);
        ball.ballLoop = this.removeLoop(ball.ballLoop);
        let that = this;
        this.placeLoop = that.addLoop(function(){
            that.raycaster.setFromCamera(that.mousePos, that.camera);
            let intersects = that.raycaster.intersectObjects([that.floor.mesh]);

            if (intersects.length !== 0) {
                that.placeLocation = intersects[0].point;
                let p = that.placeLocation;
                if(p.x <= Game.tableSize.x/2-0.05 - ball.radius && p.x >= -Game.tableSize.x/2+0.05 + ball.radius)
                    if(p.z <= Game.tableSize.z/2 - 0.05 - ball.radius && p.z >= -Game.tableSize.z/2+0.05 + ball.radius)
                        if(!that.collidingAny(new THREE.Vector3(p.x, ball.radius, p.z), ball))
                            ball.position.set(p.x, ball.radius, p.z);
            }
        });
    }
    collidingAny(pos, excludedBall){
        let balls = this.balls.filter((ball) => ball !== excludedBall);
        for(let ball of balls)
            if(pos.distanceTo(ball.position) < ball.radius + excludedBall.radius)
                return true;
        return false;
    }

    loop(that) {
        for (let i = 0; i < that.balls.length; i++)
            for (let j = 0; j < that.balls.length; j++)
                if (i != j && that.balls[i].colliding(that.balls[j]))
                    that.balls[i].resolveCollision(that.balls[j]);

        for (let funKey in that.loopFunctions)
            that.loopFunctions[funKey]();

        let rotateSpeed = 3 / Game.tps,
            powerSpeed = 10 / Game.tps;
        if (that.isPressed('Shift')){
            rotateSpeed /= 10;
            powerSpeed /= 5;
        }
        if (that.isPressed('ArrowLeft')) {
            that.keu.rotateY(rotateSpeed);
        }
        if (that.isPressed('ArrowRight')) {
            that.keu.rotateY(-rotateSpeed);
        }
        if (that.isPressed('ArrowUp')) {
            that.power += powerSpeed;
            console.log(that.power);
        }
        if (that.isPressed('ArrowDown')) {
            that.power -= powerSpeed;
            console.log(that.power);
        }


        if(that.cheatLine){
            let rotation = that.keu.rotation.y;
            if (that.keu.rotation.x === Math.PI)
                rotation = Math.PI - rotation;
            if (that.keu.rotation.x < -1)
                rotation = Math.PI - rotation;
            else if (that.keu.rotation.y < 0)
                rotation = 2 * Math.PI + rotation;
            let x = Math.cos(rotation),
                z = Math.sin(rotation),
                direction = new THREE.Vector3(z, 0, x).normalize(),
                ray = new THREE.Raycaster(that.keu.position);
            ray.ray.direction = direction;
            let intersectables = that.balls.slice();
            intersectables.push(that.wallMesh);
            let wallHits = ray.intersectObjects(intersectables);
            if (wallHits.length > 0) {
                let lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(
                    that.keu.position,
                    wallHits[0].point
                )
                let line = new THREE.Line(lineGeometry, that.lineMaterial);
                that.scene.children = that.scene.children.filter((child) => child.type !== 'Line');
                that.scene.add(line);
            }
        }


        that.raycaster.setFromCamera(that.mousePos, that.camera);

        let selectable = that.balls.map((ball) => ball);
        let intersects = that.raycaster.intersectObjects(selectable).map((i) => i.object);

        if (that.highlighting || intersects.length !== 0) {
            let highLighter = false;
            that.highlightedBall = null;
            for (let i = 0; i < selectable.length; i++) {
                let index = intersects.indexOf(selectable[i]);
                if (index === -1) {
                    // selectable[i].material.color.set(that.balls[i].color);
                } else {
                    that.highlightedBall = that.balls[i];
                    // selectable[i].material.color.set(0xff00ff);
                    highLighter = true;
                }
            }
            that.highlighting = highLighter;
        }
    }

    keydown(e, that) {
        let key = e.originalEvent.key;
        if (!that.isPressed(key)) {
            that.keyPressed.push(key);
        }
        if (key === ' ')
            that.shoot();
        if (key === '5')
            that.topView();
        if (key === '6')
            that.eastView();
        if (key === '4')
            that.westView();
        if (key === '2')
            that.southView();
        if (key === '8')
            that.northView();
        if (key === 'c'){
            that.scene.children = that.scene.children.filter((child) => child.type !== 'Line');
            that.cheatLine = !that.cheatLine;
        }
    }

    keyup(e, that) {
        let key = e.originalEvent.key;
        that.keyPressed.splice(that.keyPressed.indexOf(key), 1);
    }

    isPressed(key) {
        return this.keyPressed.includes(key);
    }

    topView() {
        this.animateObject(this.camera, new THREE.Vector3(0, 25, 0), 300, new THREE.Vector3(0, 0, 0));
    }
    westView() {
        this.animateObject(this.camera, new THREE.Vector3(15, 15, 0), 300, new THREE.Vector3(0, 0, 0));
    }
    eastView() {
        this.animateObject(this.camera, new THREE.Vector3(-15, 15, 0), 300, new THREE.Vector3(0, 0, 0));
    }
    northView() {
        this.animateObject(this.camera, new THREE.Vector3(0, 15, 25), 300, new THREE.Vector3(0, 0, 0));
    }
    southView() {
        this.animateObject(this.camera, new THREE.Vector3(0, 15, -25), 300, new THREE.Vector3(0, 0, 0));
    }

    animateObject(object, newPos, time = 1000, target = null, easing = TWEEN.Easing.Quartic.InOut) {
        return new TWEEN.Tween(object.position)
            .to(newPos, time)
            .onUpdate(function() {
                object.position.set(this.x, this.y, this.z);
                if (target)
                    object.lookAt(target);
            })
            .easing(easing)
            .start();
    }

    render(that) {
        TWEEN.update();
        that.renderer.render(that.scene, that.camera);
        requestAnimationFrame(function() {
            that.render(that);
        });
        // if(!that.laptopGraphics)
        //     for (let ball of that.balls)
        //         ball.cubeCamera.update(that.renderer, that.scene);
    }
}
