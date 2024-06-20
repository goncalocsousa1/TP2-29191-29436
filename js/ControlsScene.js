export default class ControlsScene extends Phaser.Scene {

    constructor() {
        super('ControlsScene');
    }

    preload() {
        this.load.image('terminal', 'assets/images/terminal.jpg');  // Load the terminal background image.
        this.load.image('wasd', 'assets/images/HUD/wasd.png');  // Load the WASD keys image.
        this.load.image('arrows', 'assets/images/HUD/arrows.png');  // Load the arrows keys image.
        this.load.image('enter', 'assets/images/HUD/enter.png');  // Load the Enter key image.
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'terminal')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const prompt = 'root@controls ~ $ ';
        const controlsText = prompt + 'Use WASD to move' + '\n\n\n\n';  // Added extra newlines for more space
        const controlsText2 = prompt + 'Use the arrows to shoot' + '\n\n\n\n';
        const controlsText3 = prompt + 'Use Enter to skip/exit messages' + '\n\n\n\n';

        let typingText = this.add.text(50, 50, '', { 
            font: '18px Courier',
            fill: '#00ff00',
            wordWrap: { width: this.cameras.main.width - 200 }
        });

        this.displayTextAndAwaitEnter(typingText, controlsText, () => {
            this.showControlImage('wasd', this.cameras.main.width - 150, 100, 0.5);
            this.displayTextAndAwaitEnter(typingText, controlsText2, () => {
                this.showControlImage('arrows', this.cameras.main.width - 150, 250, 0.5);
                this.displayTextAndAwaitEnter(typingText, controlsText3, () => {
                    this.showControlImage('enter', this.cameras.main.width - 170, 400, 0.15);  
                    this.autoTypeCommand(typingText, 'cd ..', prompt);
                });
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
                    callback();
                } else {
                    textObject.text += text[i++];
                    if (i === text.length) {
                        timer.remove();
                        callback();
                    }
                }
            },
            loop: true
        });
    }

    showControlImage(imageKey, imageX, imageY, scale = 0.5) {
        this.add.image(imageX, imageY, imageKey).setScale(scale);
    }

    autoTypeCommand(textObject, command, prompt) {
        let i = 0;
        let commandTyped = false;

        textObject.text += prompt;

        const commandTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (commandTyped) {
                    return;
                }

                if (i < command.length) {
                    textObject.text += command[i++];
                } else {
                    commandTyped = true;
                    commandTimer.remove();
                    this.addBlinkingCursor(textObject.x + textObject.width, textObject.y);
                    this.enableEnterToProceed();
                }
            },
            loop: true
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            if (!commandTyped) {
                textObject.text += command.slice(i);
                commandTyped = true;
                commandTimer.remove();
                this.addBlinkingCursor(textObject.x + textObject.width, textObject.y);
                this.enableEnterToProceed();
            }
        });
    }

    addBlinkingCursor(x, y) {
        let cursor = this.add.text(x, y, '_', {
            font: '18px Courier',
            fill: '#00ff00'
        }).setVisible(true);  // Ensure the cursor is initially visible

        this.time.addEvent({
            delay: 500,
            callback: () => { cursor.visible = !cursor.visible; },
            loop: true
        });
    }

    enableEnterToProceed() {
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('MenuScene');
        });
    }
}
