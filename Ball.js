class Ball extends THREE.Mesh {
    constructor(game, x = 0, z = 0, radius = 0.3075, shadow = true, color = 0xffffff) {
        let geometry = new THREE.SphereGeometry(radius, 36, 36),
            material = new THREE.MeshPhongMaterial({
                color: color
            });
        super(geometry, material);
        this.color = new THREE.Color(color);
        this.radius = radius;
        this.position.set(x, radius, z);
        this.castShadow = shadow;
        this.mass = 1;
        this.restitution = 0.8;
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
        this.stoppedRolling = function(){};
    }
    setSpeed(speed) {
        if(!this.otherBalls)
            this.otherBalls = this.getOtherBalls();
        let that = this;
        this.speed = speed;
        this.nextPosition = this.position.clone().addVectors(this.speed, this.position);
        if (!this.ballLoop) {
            this.ballLoop = that.game.addLoop(function () {
                that.moveBall(that);
            });
        }
    }
    moveBall(that) {
        that.speed.multiplyScalar(1 - that.rollFriction / Game.tps);
        let stopThreshold = 0.001;
        if (Math.abs(that.speed.x) < stopThreshold && Math.abs(that.speed.y) < stopThreshold && Math.abs(that.speed.z) < stopThreshold) {
            that.speed.set(0, 0, 0);
            that.stoppedRolling(that.game);
            that.ballLoop=that.game.removeLoop(that.ballLoop);
        }
        that.currentPosition = that.nextPosition.clone();

        let direction = that.willCollideWall();

        if(direction){
            direction.reflect(direction);
            let speed = that.speed;

            let outgoingVector=((d, n) => d.sub(n.multiplyScalar(d.dot(n)*2))),
                outgoing = outgoingVector(speed.clone(), direction);

            that.speed = outgoing.clone();
        }

        let scorePocket = false;
        if(that.position.x > 6.5 && that.position.z > 13.5)
            scorePocket = 1;
        if(that.position.x < 6.5 && that.position.z > 13.5)
            scorePocket = 2;

        if(that.position.x < -7.25 && that.position.z < 2 && that.position.z > -2)
            scorePocket = 3;

        if(that.position.x < -6.5 && that.position.z < -13.5)
            scorePocket = 4;
        if(that.position.x > 6.5 && that.position.z < -13.5)
            scorePocket = 5;

        if(that.position.x > 7.25 && that.position.z < 2 && that.position.z > -2)
            scorePocket = 6;

        if(scorePocket){
            console.log('score! in nummer ',scorePocket, 'ball: ', that);
            that.speed.set(0,0,0);
            that.ballLoop=that.game.removeLoop(that.ballLoop);
            let downPos = that.position.clone();
            downPos.y -= 3;
            that.game.animateObject(that, downPos, 500);
        }

        that.position.set(that.currentPosition.x, that.currentPosition.y, that.currentPosition.z);
        that.nextPosition = that.currentPosition.addVectors(that.speed, that.position);
    }

    willCollideWall() {
        if(Game.tableSize.x/2-Math.abs(this.nextPosition.x)>2 && Game.tableSize.z/2-Math.abs(this.nextPosition.z)>2)
            return false;
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

        directions.map((d) => d.normalize()); //misschien niet nodig
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
        return dir;
    }

    directionTo(ball) {
        return ball.nextPosition.clone().sub(this.nextPosition).normalize();
    }

    colliding(ball){
        let distance = this.nextPosition.distanceTo(ball.nextPosition);
        return distance < ball.radius + this.radius;
    }
    resolveCollision(ball){
        let direction = this.directionTo(ball);
        direction.normalize();
        let outgoingVector=((d, n) => d.sub(n.multiplyScalar(d.dot(n)*2))),
            outgoing = outgoingVector(this.speed.clone(), direction);
        this.setSpeed(outgoing.clone());
        ball.setSpeed(direction);
    }
}
