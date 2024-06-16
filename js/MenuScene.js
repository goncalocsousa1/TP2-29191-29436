export default class MenuScene extends Phaser.Scene {
    
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
    }

    create() {

        
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(475, 200, 'Hacker Madness', {
            font: '48px Arial',
            fill: '#fff'
        }).setOrigin(0.5);

        const startButton = this.add.text(475, 300, 'Start Game', {
            font: '32px Arial',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('MainScene'));
    }
}