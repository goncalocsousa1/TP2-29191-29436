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

        // Background box for the title
        this.drawTitleBackground(475, 150, 600, 100, 20, 0x201b1b);  // Bigger background for title

        let titleText = this.add.text(475, 150, 'Hacker Madness', {
            font: '60px "Courier New"', // Large font size for title
            fill: '#ffffff', // White color for the title
            stroke: '#000000', // Black stroke for the border
            strokeThickness: 6 // Thickness of the stroke
        }).setOrigin(0.5);

        // Background box and button for 'Start Game'
        this.drawBackgroundBox(475, 300, 250, 60, 20, 0x201b1b);  // Rounded corners
        const startButton = this.add.text(475, 300, 'Start Game', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('MainScene'));
        
        // Background box and button for 'History'
        this.drawBackgroundBox(475, 400, 180, 60, 20, 0x201b1b);  // Rounded corners
        const histButton = this.add.text(475, 400, 'History', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('HistoryScene'));

        // Background box and button for 'Controls'
        this.drawBackgroundBox(475, 500, 220, 60, 20, 0x201b1b);  // Rounded corners
        const controlsButton = this.add.text(475, 500, 'Controls', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('ControlsScene'));
    }

    drawTitleBackground(x, y, width, height, radius, color) {
        let graphics = this.add.graphics();
        graphics.fillStyle(color, 1.0);
        // Drawing a rounded rectangle for title background
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }

    drawBackgroundBox(x, y, width, height, radius, color) {
        let graphics = this.add.graphics();
        graphics.fillStyle(color, 1.0);
        // Drawing a rounded rectangle
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
}
