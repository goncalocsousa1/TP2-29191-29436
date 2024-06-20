export default class FinishScene extends Phaser.Scene {
    constructor() {
        super('FinishScene');
    }

    preload() {
        this.load.image('terminal', 'assets/images/terminal.jpg');  // Load the terminal background image.
        this.load.image('defender', 'assets/images/defender.png');  // Load the Windows Defender image.
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'terminal')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.add.image(centerX, centerY - 150, 'defender')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(150, 150);  // Adjust the size as needed.

        const message1 = 'C:\\WindowsDefender> Looks like I have took too long once again...\nThank you for cleaning the system tho!\n\n\n\n\n\n';
        const message2 = 'C:\\OldMan> Do not mind him... It is usual for him to take so long.\nGreat Job!';

        this.textObject = this.add.text(centerX, centerY, '', { 
            font: '18px Courier', 
            fill: '#00ff00',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5, 0.5);

        this.displayTextAndAwaitEnter(this.textObject, message1, () => {
            this.awaitEnterPress(() => {
                this.displayTextAndAwaitEnter(this.textObject, message2);
            });
        });
    }

    displayTextAndAwaitEnter(textObject, text, callback) {
        let i = 0;
        let enterPressed = false;

        this.input.keyboard.once('keydown-ENTER', () => {
            enterPressed = true;
        });

        const timer = this.time.addEvent({
            delay: 50,
            callback: () => {
                if (enterPressed) {
                    textObject.text += text.slice(i);
                    timer.remove();
                    if (callback) callback();
                } else {
                    textObject.text += text[i++];
                    if (i === text.length) {
                        timer.remove();
                        if (callback) callback();
                    }
                }
            },
            loop: true
        });
    }

    awaitEnterPress(callback) {
        this.input.keyboard.once('keydown-ENTER', callback);
    }
}
