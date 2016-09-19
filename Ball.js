class Ball extends THREE.Mesh {
    constructor(game, x = 0, z = 0, radius = 0.3075, shadow = true, number = 0, stripe = false) {
        let textureLoader = new THREE.TextureLoader();
        let map = null;
        if(number!==0)
            map = textureLoader.load(`img/balls/${number}.png`);

        let geometry = new THREE.SphereGeometry(radius, 36, 36),
            material = new THREE.MeshPhongMaterial(number === 0 ? { color: 0xffffff } : {
                map: map
            });
        super(geometry, material);


        //this.color = new THREE.Color(color);
        this.stripe = stripe;
        this.radius = radius;
        this.position.set(x, radius, z);
        this.castShadow = shadow;
        this.mass = 1;
        this.restitution = 0.8;
        this.number = number;
        this.currentRotation = 0;
        game.scene.add(this);

        //reflectivity
        // this.cubeCamera = new THREEx.CubeCamera(this);
        // game.scene.add(this.cubeCamera.object3d);
        // this.material.envMap = this.cubeCamera.textureCube;
        // this.material.reflectivity = 0.7;

        this.nextPosition = this.position;
        this.speed = new THREE.Vector3();
        this.rollFriction = 1;
        this.getOtherBalls = () => game.balls.filter((ball) => ball !== this);
        this.otherBalls = false;
        this.game = game;
        this.stoppedRolling = function() {};
    }
    setSpeed(speed) {
        if (!this.otherBalls)
            this.otherBalls = this.getOtherBalls();
        let that = this;
        this.speed = speed;
        this.nextPosition = this.position.clone().addVectors(this.speed, this.position);
        if (!this.ballLoop) {
            this.ballLoop = that.game.addLoop(function() {
                that.moveBall(that);
            });
        }
    }
    moveBall(that) {
        that.speed.multiplyScalar(1 - that.rollFriction / Game.tps);
        let stopThreshold = 0.001;
        if (that.speed.length() < stopThreshold) {
            that.speed.set(0, 0, 0);
            that.stoppedRolling(that.game);
            that.ballLoop = that.game.removeLoop(that.ballLoop);
        } else {
            let circumference = that.radius,
                traversedDistance = that.speed.length(),
                addedAngle = traversedDistance / circumference,
                rollDirection = that.speed.clone().normalize(),
                rotateAxis = new THREE.Vector3(0, 1, 0);
            rollDirection.applyAxisAngle(rotateAxis, Math.PI / 2);

            that.currentRotation += addedAngle;
            let quaternion = new THREE.Quaternion().setFromAxisAngle(rollDirection, that.currentRotation);
            that.setRotationFromQuaternion(quaternion);


            that.currentPosition = that.nextPosition.clone();

            let collision = that.willCollideWall(),
                direction = collision.direction,
                distance = collision.distance;

            if (direction) {
                direction.reflect(direction).normalize();
                if(distance < 0){
                    that.position.add(direction.clone().multiplyScalar(distance));
                    that.currentPosition = that.position.clone();
                }
                let speed = that.speed;

                let outgoingVector = ((d, n) => d.sub(n.multiplyScalar(d.dot(n) * 2))),
                    outgoing = outgoingVector(speed.clone(), direction);

                that.speed = outgoing.clone();
            }

            let scorePocket = false;
            if (that.position.x > 6.2 && that.position.z > 13.2)
                scorePocket = 1;
            if (that.position.x < -6.2 && that.position.z > 13.2)
                scorePocket = 2;

            if (that.position.x < -7.25 && that.position.z < 0.7 && that.position.z > -0.7)
                scorePocket = 3;

            if (that.position.x < -6.2 && that.position.z < -13.2)
                scorePocket = 4;
            if (that.position.x > 6.2 && that.position.z < -13.2)
                scorePocket = 5;

            if (that.position.x > 7.25 && that.position.z < 0.7 && that.position.z > -0.7)
                scorePocket = 6;

            if (scorePocket) {
                that.speed.set(0, 0, 0);
                that.ballLoop = that.game.removeLoop(that.ballLoop);
                game.score(that.number, that.stripe, scorePocket);
                let downPos = that.position.clone();
                downPos.y -= 3;
                that.game.animateObject(that, downPos, 500);
            }

            that.position.set(that.currentPosition.x, that.currentPosition.y, that.currentPosition.z);
            that.nextPosition = that.currentPosition.addVectors(that.speed, that.position);
        }
    }

    willCollideWall() {
        if (Game.tableSize.x / 2 - Math.abs(this.nextPosition.x) > 4 && Game.tableSize.z / 2 - Math.abs(this.nextPosition.z) > 4)
            return false;

        if(this.nextPosition.x > 7.1)
            return {
                direction: new THREE.Vector3(1, 0, 0),
                distance: 6.7 - this.radius - this.position.x
            };
        if(this.nextPosition.x < -7.1)
            return {
                direction: new THREE.Vector3(-1, 0, 0),
                distance: -6.7 + this.radius - this.position.x
            };

        if(this.nextPosition.z > 13.5)
            return {
                direction: new THREE.Vector3(0, 0, 1),
                distance: 13.45 - this.radius - this.position.z
            };
        if(this.nextPosition.z < -13.5)
            return {
                direction: new THREE.Vector3(0, 0, -1),
                distance: -13.45 + this.radius - this.position.z
            };

        let pX = this.nextPosition.x > 0, //Bal zit in de positieve X helft
            pZ = this.nextPosition.z > 0; //Bal zit in de positieve Z helft
        let directions = [];
        pX && directions.push(new THREE.Vector3(1, 0, 0));
        pZ && directions.push(new THREE.Vector3(0, 0, 1));
        !pX && directions.push(new THREE.Vector3(-1, 0, 0));
        !pZ && directions.push(new THREE.Vector3(0, 0, -1));
        pZ && !pX && directions.push(new THREE.Vector3(-1, 0, 1));
        pZ && !pX && directions.push(new THREE.Vector3(-1, 0, 1));
        !pZ && pX && directions.push(new THREE.Vector3(1, 0, -1));
        !pZ && !pX && directions.push(new THREE.Vector3(-1, 0, -1));

        pX && pZ && directions.push(new THREE.Vector3(1, 0, 2));
        pZ && pX && directions.push(new THREE.Vector3(2, 0, 1));
        !pX && pZ && directions.push(new THREE.Vector3(-1, 0, 2));
        !pZ && pX && directions.push(new THREE.Vector3(2, 0, -1));
        pZ && !pX && directions.push(new THREE.Vector3(-2, 0, 1));
        pZ && !pX && directions.push(new THREE.Vector3(-2, 0, 1));
        !pZ && pX && directions.push(new THREE.Vector3(1, 0, -2));
        !pZ && !pX && directions.push(new THREE.Vector3(-1, 0, -2));

        let startPoint = this.nextPosition,
            ray = new THREE.Raycaster(startPoint),
            closestWall = Infinity,
            dir = false;
        for (let direction of directions) {
            ray.ray.direction = direction;
            let intersects = ray.intersectObjects([this.game.wallMesh]);
            if (intersects.length > 0) {

                if (intersects[0].distance < closestWall) {
                    dir = direction;
                    closestWall = intersects[0].distance;
                }
            }
        }
        if (!dir || closestWall > this.radius)
            return false;
        return {
            direction: dir,
            distance: closestWall
        };
    }

    directionTo(ball) {
        return ball.nextPosition.clone().sub(this.nextPosition).normalize();
    }

    colliding(ball) {
        let distance = this.nextPosition.distanceTo(ball.nextPosition);
        return distance < ball.radius + this.radius;
    }
    resolveCollision(ball) {
        let direction = this.directionTo(ball);
        direction.normalize();
        let outgoingVector = ((d, n) => d.sub(n.multiplyScalar(d.dot(n) * 2))),
            outgoing = outgoingVector(this.speed.clone(), direction);

        if(this.speed.length() < 0.001){
            let moveOut = direction.clone();
            moveOut.normalize();
            this.position.add(moveOut.multiplyScalar(ball.position.distanceTo(this.position) - ball.radius - this.radius))
        }else{
            this.setSpeed(outgoing.clone());
            ball.setSpeed(direction.normalize().multiplyScalar(this.speed.length()));
        }
    }
}
