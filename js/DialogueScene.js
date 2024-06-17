export default class DialogueScene extends Phaser.Scene {
    constructor() {
        super('DialogueScene');
        this.currentLine = 0; // Current line of dialogue
        this.typingIndex = 0; // Index for the typing effect
        this.isTyping = false; // Flag to check if typing is in progress
        this.typingSpeed = 50; // Speed of the typing effect (milliseconds)
    }

    init(data) {
        this.dialogueData = data.dialogueData; // Dialogue data passed from MainScene
    }

    create() {
        // Add terminal style background
        this.add.rectangle(50, 350, 850, 150, 0x000000).setOrigin(0, 0);

        // Display initial dialogue line
        this.dialogueText = this.add.text(100, 400, '', {
            fontFamily: 'Courier',
            fontSize: 24,
            color: '#00ff00'
        });

        // Start typing the first line of dialogue
        this.typeLine();

        // Progress to next line on keyboard press
        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.isTyping) {
                this.progressDialogue();
            }
        });
    }

    typeLine() {
        this.isTyping = true;
        this.typingIndex = 0;
        this.dialogueText.setText('');
        this.time.addEvent({
            callback: this.typeCharacter,
            callbackScope: this,
            delay: this.typingSpeed,
            loop: true
        });
    }

    typeCharacter() {
        if (this.typingIndex < this.dialogueData[this.currentLine].length) {
            this.dialogueText.text += this.dialogueData[this.currentLine][this.typingIndex];
            this.typingIndex++;
        } else {
            this.isTyping = false;
            this.time.removeAllEvents();
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
                this.scene.resume('MainScene');
            }
        }
    }
}
