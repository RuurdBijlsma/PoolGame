//TODO
//Gaten mooier maken
//Rest van tafel maken
//Physics
//Keu animatie bij shieten DONE
//Schieten fixen (hoek soms)
//Niet schieten mogelijk als de keu er niet is
//Alle ballen toevoegen
//Scoren toevoegen
//Regels toevoegen
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
    constructor(renderElement) {
        this.laptopGraphics = false;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050423, 0.002);

        this.renderElement = $(renderElement);
        this.camera = new THREE.PerspectiveCamera(45, this.renderElement.width() / this.renderElement.height(), 0.1, 10000);
        this.camera.position.x = 0.001;
        this.camera.position.y = 20;
        this.camera.position.z = 0;
        this.camera.rotateY(Math.PI / 2);

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.shadowMap.enabled = true;
        if(this.laptopGraphics)
            this.renderer.shadowMap.type = THREE.BasicShadowMap;
        else
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.renderElement.width(), this.renderElement.height());

        this.renderElement.append(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, renderElement);

        this.balls = [
            new Ball(this),
            new Ball(this, 0, 4, 0.3075, true, 0xff0000),
            // new Ball(this, 0.3, 4.6, 0.3075, true, 0xff0000),
            // new Ball(this, -0.3, 4.6, 0.3075, true, 0xff0000),
            // new Ball(this, 0, 5.2, 0.3075, true, 0xff0000),
            // new Ball(this, 0.6, 5.2, 0.3075, true, 0xff0000),
            // new Ball(this, -0.6, 5.2, 0.3075, true, 0xff0000),
            // new Ball(this, 0.3, 5.8, 0.3075, true, 0xff0000),
            // new Ball(this, -0.3, 5.8, 0.3075, true, 0xff0000),
            // new Ball(this, 0.9, 5.8, 0.3075, true, 0xff0000),
            // new Ball(this, -0.9, 5.8, 0.3075, true, 0xff0000),
            // new Ball(this, 0, 6.4, 0.3075, true, 0xff0000),
            // new Ball(this, 0.6, 6.4, 0.3075, true, 0xff0000),
            // new Ball(this, -0.6, 6.4, 0.3075, true, 0xff0000),
            // new Ball(this, 1.2, 6.4, 0.3075, true, 0xff0000),
            // new Ball(this, -1.2, 6.4, 0.3075, true, 0xff0000)
        ];
        this.balls[0].stoppedRolling = this.whiteStop;
        this.camera.lookAt(this.balls[0].position);

        this.lights = {
            spot: new SpotLight(this.scene, 0, 5, 20, this.balls[0]),
            directional: new DirectionalLight(this.scene, 10, 10, 10, null, true, 0xffffff, 0.6),
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
            that = this;
        floorTextureLoader.load(
            'img/cloth.jpg',
            function(texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(0.15, 0.15);

                let materialSettings = that.laptopGraphics?{
                    map: texture
                }:{
                    map: texture,
                    bumpScale: 0.01,
                    bumpMap: texture
                };
                let floorMaterial = new THREE.MeshStandardMaterial(materialSettings);
                that.floorMesh = that.shapesToMesh(floorShape, 0.2, floorMaterial);
                that.floorMesh.position.y = -.2515;
                that.floorMesh.rotateX(-Math.PI / 2);
                that.floorMesh.receiveShadow = true;
                that.scene.add(that.floorMesh);
                that.camera.lookAt(that.floorMesh.position);

                that.wallMesh = that.shapesToMesh(that.wallShapes, .5, floorMaterial);
                that.wallMesh.rotateX(Math.PI / 2);
                that.wallMesh.receiveShadow = true;
                that.wallMesh.castShadow = true;
                that.wallMesh.position.y = .5;
                that.scene.add(that.wallMesh);
            }
        );

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

        this.render(this);

        this.keyPressed = [];
        $(document).keydown(function(e) {
            that.keydown(e, that);
        });
        $(document).keyup(function(e) {
            that.keyup(e, that);
        });

        this.loopFunctions = {
            0:function(){}
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
        let backPos = this.keu.children[0].position.clone(),
            frontPos = backPos.clone(),
            origPos = backPos.clone(),
            power = 12 / Game.tps;
        backPos.z-=power*5;
        frontPos.z += 1;

        let that = this;
        this.animateObject(this.keu.children[0], backPos, 500);
        self.setTimeout(function(){
            that.animateObject(that.keu.children[0], frontPos, 500);
            self.setTimeout(function(){

                let rotation = that.keu.rotation.y;
                if (that.keu.rotation.x < -1)
                    rotation = Math.PI - rotation;
                else if (that.keu.rotation.y < 0)
                    rotation = 2 * Math.PI + rotation;
                let x = Math.cos(rotation),
                    z = Math.sin(rotation),
                    speed = new THREE.Vector3(z, 0, x).multiplyScalar(power);

                that.selectedBall.setSpeed(speed);

                that.animateObject(that.keu.children[0], origPos, 700);

            },300);
        },500);
    }

    mousedown(e, that) {
        if (that.highlightedBall) {
            that.animateObject(that.keu, that.highlightedBall.position, 500);
            that.selectedBall = that.highlightedBall;
        }
    }

    mousemove(e, that) {
        that.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
        that.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    addLoop(fun){
        this.loopFunctions[this.loopAmount] = fun;
        return this.loopAmount++;
    }
    removeLoop(funIndex){
        delete this.loopFunctions[funIndex];
        return false;
    }

    whiteStop(game){
        game.animateObject(game.keu, this.position, 1000);
    }

    loop(that) {
        for(let i=0;i<that.balls.length;i++)
            for(let j=i+1;j<that.balls.length;j++)
                if(that.balls[i].colliding(that.balls[j]))
                    that.balls[i].resolveCollision(that.balls[j]);

        for(let funKey in that.loopFunctions)
            that.loopFunctions[funKey]();

        let rotateSpeed = 3 / Game.tps;
        if (that.isPressed('Shift'))
            rotateSpeed /= 5;
        if (that.isPressed('ArrowLeft')) {
            that.keu.rotateY(rotateSpeed);
        }
        if (that.isPressed('ArrowRight')) {
            that.keu.rotateY(-rotateSpeed);
        }
        that.raycaster.setFromCamera(that.mousePos, that.camera);

        let selectable = that.balls.map((ball) => ball);
        let intersects = that.raycaster.intersectObjects(selectable).map((i) => i.object);

        if (that.highlighting || intersects !== 0) {
            let highLighter = false;
            that.highlightedBall = null;
            for (let i = 0; i < selectable.length; i++) {
                let index = intersects.indexOf(selectable[i]);
                if (index === -1) {
                    selectable[i].material.color.set(that.balls[i].color);
                } else {
                    that.highlightedBall = that.balls[i];
                    selectable[i].material.color.set(0xff00ff);
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
    }

    keyup(e, that) {
        let key = e.originalEvent.key;
        that.keyPressed.splice(that.keyPressed.indexOf(key), 1);
    }

    isPressed(key) {
        return this.keyPressed.includes(key);
    }

    topView() {
        this.animateObject(this.camera, new THREE.Vector3(0, 20, 0), 300, new THREE.Vector3(0, 0, 0));
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
        new TWEEN.Tween(object.position)
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
