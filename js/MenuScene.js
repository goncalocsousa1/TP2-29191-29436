export default class MenuScene extends Phaser.Scene {
    
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
        // Load a web font or ensure a suitable monospace font is available
        // For this example, we use 'Courier New' which is generally available and fits the hacker aesthetic
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Opaque and adjusted dimensions for the title background with rounded corners
        this.drawBackgroundBox(475, 180, 450, 70, 20, 0x201b1b);  // Added radius parameter for rounded corners
        this.add.text(475, 180, 'Hacker Madness', {
            font: '48px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5);

        // Opaque and adjusted dimensions for the 'Start Game' button background with rounded corners
        this.drawBackgroundBox(475, 270, 250, 60, 20, 0x201b1b);  // Rounded corners
        const startButton = this.add.text(475, 270, 'Start Game', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('MainScene'));
        
        // Opaque and adjusted dimensions for the 'History' button background with rounded corners
        this.drawBackgroundBox(475, 370, 180, 60, 20, 0x201b1b);  // Rounded corners
        const HistButton = this.add.text(475, 370, 'History', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('HistoryScene'));

        // Opaque and adjusted dimensions for the 'Controls' button background with rounded corners
        this.drawBackgroundBox(475, 470, 220, 60, 20, 0x201b1b);  // Rounded corners
        const controlsButton = this.add.text(475, 470, 'Controls', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('ControlsScene'));
    }

    drawBackgroundBox(x, y, width, height, radius, color) {
        let graphics = this.add.graphics();
        graphics.fillStyle(color, 1.0);
        // Drawing a rounded rectangle
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
}
