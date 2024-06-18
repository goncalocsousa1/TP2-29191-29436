export default class LoseScene extends Phaser.Scene {

    constructor() {
        super('LoseScene');
    }

    preload() {
        this.load.image('terminal', 'assets/images/terminal.jpg');
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'terminal')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const errorMessage = '404 Life Not Found';
        let typingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, '', {
            font: '48px "Courier New"',
            fill: '#ff0000'
        }).setOrigin(0.5);

        let i = 0;

        const timer = this.time.addEvent({
            delay: 100,
            callback: () => {
                typingText.text += errorMessage[i++];
                if (i === errorMessage.length) {
                    timer.remove();
                    this.showButtons();
                }
            },
            loop: true
        });
    }

    showButtons() {
        // Opaque and adjusted dimensions for the 'Restart' button background with rounded corners
        this.drawBackgroundBox(this.cameras.main.centerX, this.cameras.main.centerY + 50, 250, 60, 20, 0x201b1b);  // Rounded corners
        const restartButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Restart', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('MainScene'));
        
        // Opaque and adjusted dimensions for the 'Back to Menu' button background with rounded corners
        this.drawBackgroundBox(this.cameras.main.centerX, this.cameras.main.centerY + 150, 250, 60, 20, 0x201b1b);  // Rounded corners
        const menuButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 150, 'Back to Menu', {
            font: '32px "Courier New"',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));
    }

    drawBackgroundBox(x, y, width, height, radius, color) {
        let graphics = this.add.graphics();
        graphics.fillStyle(color, 1.0);
        // Drawing a rounded rectangle
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
}
