export default class FirstLeftScene extends Phaser.Scene {
    constructor() {
        super('FirstLeftScene');
        this.bullets;
        this.canShootIce = true;
        this.isEnemyDestroyed = false;
        this.hitCooldown = false;
        this.currentDirection;
        this.enemies = [];
        this.enemyHits1 = 3;
        this.enemyHits2 = 3;
        this.enemyHits3 = 3;
        this.dialogueSceneKey = 'DialogueSceneFL'; // Key for the DialogueScene
        this.oldmanDialogue = [
            "C:\\OldMan> This is the Internet Explorer. It can function like a target dummy for you to train for the upcoming challenges. Since they are sooo slow..."
        ];
        this.dialogueTriggered = false;
    }

    init(data) {
        this.playerHealth = data.playerHealth || 5;
        this.heartTextures = data.hearts || ['full_health_heart', 'full_health_heart', 'full_health_heart', 'full_health_heart', 'full_health_heart'];
        this.hearts = [];
    }

    preload() {
        this.load.image('tiles', 'assets/images/tileset.png');
        this.load.tilemapTiledJSON('motherboard', 'assets/maps/motherboard.json');
        this.load.atlas('Nerd', 'assets/images/Player/nerd.png', 'assets/images/Player/nerd_atlas.json');
        this.load.spritesheet('ice', 'assets/images/Attacks/Ice.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('nerd', 'assets/images/Player/nerd.png', { frameWidth: 96, frameHeight: 96 });
        this.load.image('full_health_heart', 'assets/images/HUD/full_health_heart.png');
        this.load.image('half_health_heart', 'assets/images/HUD/half_health_heart.png');
        this.load.image('empty_health_heart', 'assets/images/HUD/empty_health_heart.png');
        this.load.image('nerd_face', 'assets/images/HUD/nerdFace.png');
        this.load.image('internet_explorer', 'assets/images/Enemies/internetExplorer.png');
        this.load.spritesheet('portal', 'assets/images/Portal/portal.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.cameras.main.setZoom(0.95);

        const map = this.make.tilemap({ key: 'motherboard' });
        const tileset = map.addTilesetImage('motherboard', 'tiles');
        
        this.walls = map.createLayer('wall', tileset, 0, 0).setScale(0.75);
        this.walls.setCollisionByExclusion([-1]);

        const backgroundLayer = map.createLayer('ground', tileset, 0, 0).setScale(0.75);

        if (!this.walls || !backgroundLayer) {
            console.error("Layer not found in the tilemap. Check the layer names.");
            return;
        }
        
        // Initialize hearts display
        for (let i = 0; i < 5; i++) {
            let xPosition = 70 + i * 30;
            let heart = this.add.image(xPosition, 25, this.heartTextures[i]).setScale(2);
            this.hearts.push(heart);
        }

        this.player = this.physics.add.sprite(800, 265, 'nerd').setScale(0.75);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(48, 48);
        this.player.body.setOffset((this.player.width - 48) / 2, (this.player.height - 48) / 2);
        this.physics.add.collider(this.player, this.walls);

        this.nerdFace = this.add.image(90, 45, 'nerd_face').setScale(0.3);

        // Create a group for enemies
        this.enemyGroup = this.physics.add.group();

        // Create three Internet Explorer enemies
        this.enemies.push(this.createEnemy(250, 250));
        this.enemies.push(this.createEnemy(450, 30));
        this.enemies.push(this.createEnemy(700, 150));

        this.portal1 = this.add.sprite(870, 265, 'portal').setScale(1.5);
        this.anims.create({
            key: 'portal-idle',
            frames: this.anims.generateFrameNumbers('portal', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });
        this.portal1.anims.play('portal-idle', true);
        this.physics.world.enable(this.portal1);
        this.portal1.body.setSize(20, 50);

        this.portal2 = this.add.sprite(450, 30, 'portal').setScale(2);
        this.portal2.setAngle(90);
        this.portal2.setVisible(false);

        this.anims.create({
            key: 'portal-closing',
            frames: this.anims.generateFrameNumbers('portal', { frames: [16, 17, 18, 19, 20, 21, 22, 23]}),
            frameRate: 8,
            repeat: 0
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
        this.anims.create({
            key: 'EnemyHit',
            frames: this.anims.generateFrameNumbers('ice', { start: 13, end: 19 }),
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
            rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 } });

        this.bullets = this.physics.add.group({
            defaultKey: 'ice',
            runChildUpdate: true 
        });

        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerDamage, null, this);
        this.physics.add.overlap(this.player, this.portal1, this.closePortal, null, this);

        // Add colliders between enemies
        this.physics.add.collider(this.enemyGroup, this.enemyGroup);

        // Trigger the old man's dialogue after 1-2 seconds
        this.time.delayedCall(1000, () => {
            this.triggerOldmanDialogue();
        });
    }

    update() {
        const speed = 150;
        let playerVelocity = new Phaser.Math.Vector2();
        let isMoving = false;

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

        if (this.inputKeys.left.isDown) {
            playerVelocity.x = -1;
            if (!isMoving) {
                this.player.anims.play('andar-esquerda-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.right.isDown) {
            playerVelocity.x = 1;
            if (!isMoving) {
                this.player.anims.play('andar-direita-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.up.isDown) {
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

        const enemySpeed = 40; // Speed in pixels per second

        this.enemies.forEach(enemy => {
            this.updateEnemy(enemy, enemySpeed);
        });

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

    createEnemy(x, y) {
        let enemy = this.physics.add.sprite(x, y, 'internet_explorer').setScale(0.20);
        enemy.setCollideWorldBounds(true);
        enemy.body.setSize(enemy.width * 0.75, enemy.height * 0.75); // Increase hitbox size to 75% of original size
        this.enemyGroup.add(enemy); // Add enemy to the group
        return enemy;
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
            delay: 1000,
            callback: () => {
                this.canShootIce = true;
            },
            callbackScope: this
        });
        this.enemies.forEach((enemy, index) => {
            this.physics.add.overlap(this.bullets, enemy, (bullet, enemy) => this.bulletHitEnemy(bullet, enemy, index), null, this);
        });
    }

    bulletHitEnemy(enemy, icebullet, index) {
        if (this.hitCooldown) return;

        this.hitCooldown = true;

        let enemyHits;
        switch(index) {
            case 0:
                enemyHits = this.enemyHits1;
                this.enemyHits1 -= 1;
                break;
            case 1:
                enemyHits = this.enemyHits2;
                this.enemyHits2 -= 1;
                break;
            case 2:
                enemyHits = this.enemyHits3;
                this.enemyHits3 -= 1;
                break;
        }
        
        console.log(`Vidas restantes do Inimigo ${index + 1}:`, enemyHits - 1);

        if (enemyHits <= 1) {
            enemy.setActive(false).setVisible(false);
            enemy.body.enable = false;
            console.log(`Inimigo ${index + 1} destruído`);
            this.checkAllEnemiesDestroyed();
        } else {
            icebullet.anims.play('EnemyHit');
        }

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.hitCooldown = false;
            },
            callbackScope: this
        });

        this.time.delayedCall(500, () => {
            icebullet.destroy();
        });
    }

    updateEnemy(enemy, speed) {
        this.physics.moveToObject(enemy, this.player, speed);
    }

    checkAllEnemiesDestroyed() {
        if (this.enemyHits1 <= 0 && this.enemyHits2 <= 0 && this.enemyHits3 <= 0) {
            this.portal2.setVisible(true);
            this.portal2.anims.play('portal-open', true).on('animationcomplete', () => {
                this.portal2.anims.play('portal-idle', true);
                this.physics.world.enable(this.portal2);
                this.portal2.body.setSize(35, 10);
                this.physics.add.overlap(this.player, this.portal2, this.enterPortal, null, this);
            });
        }
    }

    closePortal(player, portal) {
        if (portal === this.portal1) {
            portal.anims.play('portal-closing', true);
            portal.on('animationcomplete', () => {
                portal.destroy();
            });
        } else {
            this.enterPortal(player, portal);
        }
    }

    enterPortal(player, portal) {
        if (portal === this.portal2) {
            this.scene.start('SecondUpScene', { playerHealth: this.playerHealth, hearts: this.heartTextures });
        }
    }

    handlePlayerDamage(player, enemy) {
        this.applyDamageToPlayer(0.5);
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

        // Update heart textures for transfer to the next scene
        this.heartTextures = this.hearts.map(heart => heart.texture.key);
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

    triggerOldmanDialogue() {
        if (!this.dialogueTriggered) {
            this.dialogueTriggered = true;
            this.scene.launch(this.dialogueSceneKey, { dialogueData: this.oldmanDialogue });
            this.scene.pause();

            this.events.on('resume', () => {
                this.scene.resume();
            });
        }
    }
}
