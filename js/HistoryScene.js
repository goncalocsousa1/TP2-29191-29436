export default class HistoryScene extends Phaser.Scene {
    
    constructor() {
        super('HistoryScene');
    }

    preload() {
        this.load.image('terminal', 'assets/images/terminal.jpg');  // Load the terminal background image.
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'terminal')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const prompt = 'root@history ~ $ ';
        const storyText = prompt + 'A young hacker was proposed to make a game for an university subject, ' +
            'when he got home and decided to do it, he noticed his computer had some viruses ' +
            'and, when trying to deal with them, he was sent to a different dimension inside ' +
            'the computer where he will need to apply his knowledge to defeating them.\n\n';

        let typingText = this.add.text(50, 50, '', { 
            font: '18px Courier',
            fill: '#00ff00',
            wordWrap: { width: this.cameras.main.width - 100 }
        });

        let i = 0;
        const timer = this.time.addEvent({
            delay: 50,
            callback: () => {
                typingText.text += storyText[i++];
                if (i === storyText.length) {
                    timer.remove();
                    this.autoTypeCommand(typingText, 'cd ..', prompt);
                }
            },
            loop: true
        });
    }

    autoTypeCommand(textObject, command, prompt) {
        let i = 0;
        textObject.text += prompt;
        const commandTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                textObject.text += command[i++];
                if (i === command.length) {
                    commandTimer.remove();
                    this.addBlinkingCursor(textObject.x + textObject.width, textObject.y);
                    this.enableEnterToProceed();
                }
            },
            loop: true
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
