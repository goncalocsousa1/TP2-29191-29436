export default class BlueScreenScene extends Phaser.Scene {

    constructor() {
        super('BlueScreenScene');
    }

    preload() {
        this.load.image('bluescreen', 'assets/images/bluescreen.png');  // Load the terminal background image.
    }

    create() {
        
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'bluescreen')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

       
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('MenuScene');  
        });
    }
}
