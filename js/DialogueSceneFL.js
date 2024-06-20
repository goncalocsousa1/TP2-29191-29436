export default class DialogueSceneFL extends Phaser.Scene {
    constructor() {
        super('DialogueSceneFL');
        this.currentLine = 0; // Current line of dialogue
        this.typingIndex = 0; // Index for the typing effect
        this.isTyping = false; // Flag to check if typing is in progress
        this.typingSpeed = 50; // Speed of the typing effect (milliseconds)
    }

    init(data) {
        this.dialogueData = data.dialogueData || []; // Dialogue data passed from MainScene
    }

    create() {
        if (!this.dialogueData.length) {
            console.error('Dialogue data is empty or not properly initialized.');
            this.scene.stop();
            this.scene.resume('FirstLeftScene');
            return;
        }

        // Add terminal style background with reduced height
        this.add.rectangle(50, 350, 850, 100, 0x000000).setOrigin(0, 0);

        // Display initial dialogue line
        this.dialogueText = this.add.text(100, 360, '', {
            fontFamily: 'Courier',
            fontSize: 16, // Smaller font size
            color: '#00ff00',
            wordWrap: { width: 800, useAdvancedWrap: true } // Word wrap settings
        });

        // Start typing the first line of dialogue
        this.typeLine();

        // Progress to next line on keyboard press
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.isTyping) {
                this.completeCurrentLine();
            } else {
                this.progressDialogue();
            }
        });
    }

    typeLine() {
        this.isTyping = true;
        this.typingIndex = 0;
        this.dialogueText.setText('');
        this.typeCharacter();
    }

    typeCharacter() {
        this.time.addEvent({
            delay: this.typingSpeed,
            callback: () => {
                if (this.typingIndex < this.dialogueData[this.currentLine].length) {
                    this.dialogueText.text += this.dialogueData[this.currentLine][this.typingIndex];
                    this.typingIndex++;
                    this.typeCharacter();
                } else {
                    this.isTyping = false;
                }
            },
            callbackScope: this
        });
    }

    completeCurrentLine() {
        if (this.isTyping && this.dialogueData[this.currentLine]) {
            this.dialogueText.setText(this.dialogueData[this.currentLine]);
            this.typingIndex = this.dialogueData[this.currentLine].length;
            this.isTyping = false;
        }
    }

    progressDialogue() {
        if (!this.isTyping) {
            if (this.currentLine < this.dialogueData.length - 1) {
                this.currentLine++;
                this.typeLine();
            } else {
                // End dialogue and resume MainScene
                this.scene.stop();
                this.scene.resume('FirstLeftScene');
            }
        }
    }
}