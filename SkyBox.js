//Geinspireerd door Hindrik
class SkyBox extends THREE.Mesh {
    constructor(game, directory) {
        let urls = [directory + 'posx.jpg', directory + 'negx.jpg', directory + 'posy.jpg', directory + 'negy.jpg', directory + 'posz.jpg', directory + 'negz.jpg'],
            skyGeometry = new THREE.CubeGeometry(10000, 10000, 10000),
            materialArray = [],
            textureLoader = new THREE.TextureLoader();

        for (let url of urls) {
            materialArray.push(new THREE.MeshBasicMaterial({
                map: textureLoader.load(url),
                side: THREE.BackSide
            }));
        }

        let skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        super(skyGeometry, skyMaterial);
        game.scene.add(this);

        let that = this;
        this.loop = game.addLoop(function(){
            that.position.set(game.camera.position.x, game.camera.position.y, game.camera.position.z);
        });
    }
}