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
        game.scene.add(this);

        //reflectivity
        this.cubeCamera = new THREEx.CubeCamera(this);
        game.scene.add(this.cubeCamera.object3d);
        this.material.envMap = this.cubeCamera.textureCube;
        this.material.reflectivity = 0.7;

        this.nextPosition = this.position;
        this.speed = new THREE.Vector3();
        this.rollFriction = 1;
        this.getOtherBalls = () => game.balls.filter((ball) => ball !== this);
        this.game = game;
    }
    setSpeed(speed) {
        this.otherBalls = this.getOtherBalls();
        let that = this;
        this.speed = speed;
        if (this.ballLoop)
            clearInterval(this.ballLoop);
        this.nextPosition = this.position.clone().addVectors(this.speed, this.position);
        this.ballLoop = self.setInterval(function() {
            that.moveBall(that);
        }, 1000 / Game.tps);
    }
    moveBall(that) {
        that.speed.multiplyScalar(1 - that.rollFriction / Game.tps);
        let stopThreshold = 0.001;
        if (Math.abs(that.speed.x) < stopThreshold && Math.abs(that.speed.y) < stopThreshold && Math.abs(that.speed.z) < stopThreshold) {
            that.speed.set(0, 0, 0);
            clearInterval(that.ballLoop);
        }
        that.currentPosition = that.nextPosition.clone();

        let collision = that.willCollide();

        if(collision){
            console.log('collision');
            let direction = collision.direction,
                type = collision.type;

            direction.reflect(direction);
            let speed = that.speed.clone();

            let outgoingVector=((d, n) => d.sub(n.multiplyScalar(d.dot(n)*2))),
                outgoing = outgoingVector(speed, direction);

            that.speed = outgoing.clone();
        }

        that.position.set(that.currentPosition.x, that.currentPosition.y, that.currentPosition.z);
        that.nextPosition = that.currentPosition.addVectors(that.speed, that.position);
    }

    willCollide(){
        let direction,
            type='ball';
        for (let ball of this.otherBalls) {
            direction = this.willCollideBall(ball);
            if(direction)
                break;
        }
        if (!direction){
            direction = this.willCollideWall();
            type='wall';
        }
        if(!direction)
            return false;
        return {
            direction: direction,
            type: type
        }
    }

    willCollideWall() {
        let pX = this.nextPosition.x > 0, //Bal zit in de positieve X helft
            pZ = this.nextPosition.z > 0 //Bal zit in de positieve Z helft
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
        let dx = ball.position.x - this.position.x,
            dy = ball.position.y - this.position.y,
            dz = ball.position.z - this.position.z,
            v = new THREE.Vector3(dx, dy, dz);
        v.normalize();
        return v;
    }

    willCollideBall(ball) {
        let distance = this.nextPosition.distanceTo(ball.nextPosition);
        if (distance > ball.radius + this.radius)
            return false
        return this.directionTo(ball);
    }
}
