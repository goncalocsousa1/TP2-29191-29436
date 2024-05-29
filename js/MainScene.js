export default class MainScene extends Phaser.Scene {
    constructor(){
        super('MainScene');
    }

    preload() {
        console.log("preload");
    }

    create() {
        console.log("create");
        this.player = new Phaser.Physics.Matter.Sprite(this.matter.world);
    }

    update() {
        console.log("update");
    }
}