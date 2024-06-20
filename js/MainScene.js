export default class MainScene extends Phaser.Scene {

    constructor() {
        super('MainScene');
        this.bullets;
        this.canShootIce = true;
        this.canShootFireball = true;
        this.hitCooldown = false;
        this.currentDirection;
        this.playerHealth = 5; // Initial player health
        this.dialogueSceneKey = 'DialogueScene'; // Key for the DialogueScene
        this.oldmanDialogue = [
            "C:\\OldMan> Hey! You're finally here!",
            "C:\\OldMan> I'll be your guide in defeating the viruses!",
            "C:\\OldMan> There's many different types of them but, with your knowledge, it should be easy.",
            "C:\\OldMan> The viruses seem to be weirdly agitated this time...",
            "C:\\OldMan> Maybe, this time, there's something more serious going on...",
            "C:\\OldMan> Enter that portal and find out!"
        ];
        this.dialogueTriggered = false;
        this.oldmanDialogueCompleted = false; // Flag to check if oldman dialogue is completed
        this.hearts = []; // Heart array
        this.portal1 = null; // Reference to the portal
        let walls; // Reference to the wall layer
    }

    preload() {
        console.log("preload");
        
        // Load assets
        this.load.image('tiles', 'assets/images/motherboard.png');
        this.load.tilemapTiledJSON('motherboard', 'assets/maps/motherboard.json');
        this.load.spritesheet('ice', 'assets/images/Attacks/Ice.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('fireball', 'assets/images/Attacks/fireball.png', { frameWidth: 64, frameHeight: 32 });
        this.load.spritesheet('nerd', 'assets/images/Player/nerd.png', { frameWidth: 96, frameHeight: 96 });
        this.load.image('full_health_heart', 'assets/images/HUD/full_health_heart.png');
        this.load.image('half_health_heart', 'assets/images/HUD/half_health_heart.png');
        this.load.image('empty_health_heart', 'assets/images/HUD/empty_health_heart.png');
        this.load.image('nerd_face', 'assets/images/HUD/nerdFace.png');
        this.load.spritesheet('oldman', 'assets/images/Characters/48x48.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('portal', 'assets/images/Portal/portal.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.cameras.main.setZoom(0.95);
        console.log("create");
        
        const map = this.make.tilemap({ key: 'motherboard' });
        const tileset = map.addTilesetImage('motherboard', 'tiles');
        
        this.walls = map.createLayer('wall', tileset, 0, 0).setScale(0.75);
        this.walls.setCollisionByExclusion([-1]);
        
        const backgroundLayer = map.createLayer('ground', tileset, 0, 0).setScale(0.75);

        this.player = this.physics.add.sprite(475, 265, 'nerd').setScale(0.75);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(48, 48);
        this.player.body.setOffset((this.player.width - 48) / 2, (this.player.height - 48) / 2);
        this.physics.add.collider(this.player, this.walls);
    
        this.nerdFace = this.add.image(90, 45, 'nerd_face').setScale(0.3);

        for (let i = 0; i < 5; i++) {
            let xPosition = 70 + i * 30;
            let heart = this.add.image(xPosition, 25, 'full_health_heart').setScale(2);
            this.hearts.push(heart);
        }

        this.oldman = this.physics.add.sprite(450, 50, 'oldman').setScale(1);
        
        this.anims.create({
            key: 'oldmanidle',
            frames: this.anims.generateFrameNumbers('oldman', { start: 1, end: 4 }),
            frameRate: 8,
            repeat: -1
        });
        this.oldman.anims.play('oldmanidle', true);

        this.anims.create({
            key: 'portal-idle',
            frames: this.anims.generateFrameNumbers('portal', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'portal-open',
            frames: this.anims.generateFrameNumbers('portal', { frames: [8, 9, 10, 11, 12, 13, 14, 15] }),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'andar-direita-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [6, 7, 8, 7] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'andar-esquerda-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [3, 4, 5, 4] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'andar-frente-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [9, 10, 11, 10] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'andar-tras-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [0, 1, 2, 1] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Ataque',
            frames: this.anims.generateFrameNumbers('ice', { start: 0, end: 12 }),
            frameRate: 8,
            repeat: -1
        });

        this.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
            downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
            leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
            rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 } });
        this.bullets = this.physics.add.group({
            defaultKey: 'ice',
            runChildUpdate: true 
        });

        this.physics.add.overlap(this.player, this.oldman, this.interactWithOldman, null, this);
        this.physics.add.overlap(this.bullets, this.oldman, this.hitOldman, null, this);

        this.physics.world.createDebugGraphic();

        // Add the message above the oldman
        this.showOldmanMessage();
    }

    update() {
        const speed = 150;
        let playerVelocity = new Phaser.Math.Vector2();
        let isMoving = false;

        // Check for combined key presses first to handle diagonal movement
        if (this.inputKeys.up.isDown && (this.inputKeys.right.isDown || this.inputKeys.left.isDown)) {
            playerVelocity.y = -1;
            this.player.anims.play('andar-frente-animation', true);
            isMoving = true;
        }
        if (this.inputKeys.down.isDown && (this.inputKeys.right.isDown || this.inputKeys.left.isDown)) {
            playerVelocity.y = 1;
            this.player.anims.play('andar-tras-animation', true);
            isMoving = true;
        }

        // Handle single key presses
        if (this.inputKeys.left.isDown ) {
            playerVelocity.x = -1;
            if (!isMoving) {
                this.player.anims.play('andar-esquerda-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.right.isDown ) {
            playerVelocity.x = 1;
            if (!isMoving) {
                this.player.anims.play('andar-direita-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.up.isDown ) {
            playerVelocity.y = -1;
            if (!isMoving) {
                this.player.anims.play('andar-frente-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.down.isDown) {
            playerVelocity.y = 1;
            if (!isMoving) {
                this.player.anims.play('andar-tras-animation', true);
            }
            isMoving = true;
        }

        if (!isMoving) {
            this.player.anims.stop();
        }

        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.player.setVelocity(playerVelocity.x, playerVelocity.y);

        this.graphics.clear();

        if (isMoving) {
            playerVelocity.normalize();
            playerVelocity.scale(speed);
            this.player.setVelocity(playerVelocity.x, playerVelocity.y);
        } else {
            this.player.setVelocity(0, 0);
        }

        if (this.inputKeys.upArrow.isDown) {
            this.currentDirection = 'up';
            this.fireBullet();
        }
        if (this.inputKeys.downArrow.isDown) {
            this.currentDirection = 'down';
            this.fireBullet();
        }
        if (this.inputKeys.leftArrow.isDown) {
            this.currentDirection = 'left';
            this.fireBullet();
        }
        if (this.inputKeys.rightArrow.isDown) {
            this.currentDirection = 'right';
            this.fireBullet();
        }
    }

    fireBullet() {
        if (!this.canShootIce) return;
        this.canShootIce = false;
    
        let bulletX = this.player.x;
        let bulletY = this.player.y;
        const offset = 20;
        let velocityX = 0;
        let velocityY = 0;
    
        const icebullet = this.bullets.get(bulletX, bulletY, 'ice');
        icebullet.setScale(1).setActive(true).setVisible(true);
        const hitboxSize = 30;
        icebullet.body.setSize(hitboxSize, hitboxSize);
        icebullet.body.setOffset((icebullet.width - hitboxSize) / 2, (icebullet.height - hitboxSize) / 2);
    
        switch (this.currentDirection) {
            case 'left':
                bulletX -= offset;
                velocityX = -400;
                icebullet.angle = 180;
                break;
            case 'right':
                bulletX += offset;
                velocityX = 400;
                icebullet.angle = 0;
                break;
            case 'up':
                bulletY -= offset;
                velocityY = -400;
                icebullet.angle = -90;
                break;
            case 'down':
                bulletY += offset;
                velocityY = 400;
                icebullet.angle = 90;
                break;
        }
    
        icebullet.setPosition(bulletX, bulletY);
        icebullet.setVelocity(velocityX, velocityY);
        icebullet.anims.play("Ataque");
    
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.canShootIce = true;
            },
            callbackScope: this
        });
    }

    enterPortal(player, portal) {
        if (this.oldmanDialogueCompleted) {
            this.scene.start('FirstLeftScene', {
                playerHealth: this.playerHealth,
                hearts: this.hearts.map(heart => heart.texture.key) // Pass the heart textures
            });
        }
    }

    interactWithOldman(player, oldman) {
        if (!this.dialogueTriggered) {
            this.dialogueTriggered = true;
            this.scene.launch(this.dialogueSceneKey, { dialogueData: this.oldmanDialogue });
            this.scene.pause();

            this.events.on('resume', () => {
                this.oldmanDialogueCompleted = true;
                this.createPortal();
                this.scene.resume();
            });
        }
    }

    createPortal() {
        this.portal1 = this.add.sprite(50, 265, 'portal').setScale(1.5);
        this.portal1.anims.play('portal-open', true).on('animationcomplete', () => {
            this.portal1.anims.play('portal-idle', true);
            this.physics.world.enable(this.portal1);
            this.portal1.body.setSize(20, 50);
            this.physics.add.overlap(this.player, this.portal1, this.enterPortal, null, this);
        });
    }

    updateHealthDisplay() {
        let fullHearts = Math.floor(this.playerHealth);
        let halfHeart = (this.playerHealth % 1 !== 0);
        this.hearts.forEach((heart, index) => {
            if (index < fullHearts) {
                heart.setTexture('full_health_heart');
            } else if (index === fullHearts && halfHeart) {
                heart.setTexture('half_health_heart');
            } else {
                heart.setTexture('empty_health_heart');
            }
        });
    }

    applyDamageToPlayer(damage) {
        if (!this.hitCooldown) {
            this.playerHealth -= damage;
            this.hitCooldown = true;
            this.time.addEvent({
                delay: 1000,
                callback: () => { this.hitCooldown = false; },
                callbackScope: this
            });
            this.updateHealthDisplay();
            if (this.playerHealth <= 0) {
                this.gameOver();
            }
        }
    }

    gameOver() {
        this.physics.pause();
        this.anims.pauseAll();
        this.scene.start('LoseScene');
    }

    showOldmanMessage() {
        const message = "Hello, I was waiting, come and talk to me";
        const text = this.add.text(this.oldman.x, this.oldman.y - 50, message, {
            font: "16px Arial",
            fill: "#00ff00", // Green color
            backgroundColor: "#111111"
        }).setOrigin(0.5, 0.5);

        this.time.addEvent({
            delay: 3000,
            callback: () => {
                text.destroy();
            },
            callbackScope: this
        });
    }

    hitOldman(bullet, oldman) {
        bullet.destroy();
        this.scene.start('BlueScreenScene'); 
    }
}
