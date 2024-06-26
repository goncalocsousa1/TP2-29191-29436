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
        const storyText = prompt + 'A young hacker was proposed to make a game for a university subject. ' +
            'When he got home and decided to do it, he noticed his computer had some viruses. ' +
            'As he delved deeper into the problem, he found himself battling more than just code. ' +
            'The viruses were unlike anything he had ever encountered—complex, adaptive, and almost... alive.\n\n' +
            'Frustrated but determined, he decided to take a break. Little did he know, this decision would change his life forever. ' +
            'When he returned to his computer, a strange message flashed on his screen: "WELCOME TO THE DIGITAL REALM." ' +
            'Before he could react, a surge of energy enveloped him, pulling him into a vortex of binary code and flashing lights.\n\n' +
            'He woke up in a strange new world—inside his computer. The digital landscape was vast and filled with towering structures of data and rivers of streaming information. ' +
            'This was the Digital Realm, a place where viruses had evolved into monstrous entities, and the only way to survive was to use his hacking skills.\n\n';

        let typingText = this.add.text(50, 50, '', { 
            font: '18px Courier',
            fill: '#00ff00',
            wordWrap: { width: this.cameras.main.width - 100 }
        });

        this.displayTextAndAwaitEnter(typingText, storyText, () => {
            this.autoTypeCommand(typingText, 'cd ..', prompt);
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
