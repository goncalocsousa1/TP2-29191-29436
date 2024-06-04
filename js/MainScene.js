export default class MainScene extends Phaser.Scene {
    constructor(){
        super('MainScene');
    }

    preload() {
        console.log("preload");
        this.load.atlas('Nerd', 'assets/images/Player/nerd.png', 'assets/images/Player/nerd_atlas.json');
    }

    create() {
        console.log("create");
        this.player = new Phaser.Physics.Matter.Sprite(this.matter.world, 250, 200, 'Nerd', 'frente-parado');
        this.add.existing(this.player);
        this.inputKeys = this.input.keyboard.addKeys({

            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
            downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
            leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
            rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT
        })
    }

    update() {
        console.log("update");
        const speed = 2.5;
        let playerVelocity = new Phaser.Math.Vector2();

        if (this.inputKeys.left.isDown || this.inputKeys.leftArrow.isDown) {
            playerVelocity.x = -1;
        }
        if (this.inputKeys.right.isDown || this.inputKeys.rightArrow.isDown) {
            playerVelocity.x = 1;
        }
        if (this.inputKeys.up.isDown || this.inputKeys.upArrow.isDown) {
            playerVelocity.y = -1;
        }
        if (this.inputKeys.down.isDown || this.inputKeys.downArrow.isDown) {
            playerVelocity.y = 1;
        }

        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.player.setVelocity(playerVelocity.x, playerVelocity.y);
    }
}