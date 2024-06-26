export default class SecondUpScene extends Phaser.Scene {
    constructor() {
        super('SecondUpScene');
        this.bullets;
        this.canShootIce = true;
        this.isEnemyDestroyed = false;
        this.hitCooldown = false;
        this.currentDirection;
        this.enemies = [];
        this.dialogueSceneKey = 'DialogueSceneSU'; // Key for the DialogueScene
        this.oldmanDialogue = [
            "C:\\OldMan> These are real deal. Use the skills you got on the previous phase to eliminate this viruses!"
        ];
        this.dialogueTriggered = false;

        // Global enemy hit points
        this.enemyHits = [4, 4, 4, 4, 4]; // Five enemies
        this.healthbars = [];
        this.healthbarBackgrounds = [];
    }

    init(data) {
        // Receive the global player health and hearts from the previous scene
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
        this.load.spritesheet('skeleton', 'assets/images/Enemies/Skeleton.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cacodaemon', 'assets/images/Enemies/Cacodaemon.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('portal', 'assets/images/Portal/portal.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('portalFinal', 'assets/images/Portal/portalFinal.png', { frameWidth: 64, frameHeight: 64 });
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

        this.player = this.physics.add.sprite(450, 450, 'nerd').setScale(0.75);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(48, 48);
        this.player.body.setOffset((this.player.width - 48) / 2, (this.player.height - 48) / 2);
        this.physics.add.collider(this.player, this.walls);

        this.nerdFace = this.add.image(90, 45, 'nerd_face').setScale(0.3);

        // Create a group for enemies
        this.enemyGroup = this.physics.add.group();

        // Create enemies with health bars
        this.createCacodaemon(300, 250, 0);
        this.createCacodaemon(100, 30, 1);
        this.createCacodaemon(700, 150, 2);
        this.createSkeleton(200, 200, 3);
        this.createSkeleton(600, 200, 4);

        this.portal1 = this.add.sprite(450, 510, 'portal').setScale(2);
        this.portal1.anims.play('portal-idle', true);
        this.portal1.setAngle(90);
        this.physics.world.enable(this.portal1);
        this.portal1.body.setSize(35, 10);

        this.portal2 = this.add.sprite(450, 30, 'portalFinal').setScale(3);
        this.portal2.setAngle(90);
        this.portal2.setVisible(false);

        this.anims.create({
            key: 'portalFinal-idle',
            frames: this.anims.generateFrameNumbers('portalFinal', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'portal-closing',
            frames: this.anims.generateFrameNumbers('portal', { frames: [16, 17, 18, 19, 20, 21, 22, 23]}),
            frameRate: 8,
            repeat: 0
        });

        this.anims.create({
            key: 'portal-idle',
            frames: this.anims.generateFrameNumbers('portal', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'portalFinal-open',
            frames: this.anims.generateFrameNumbers('portalFinal', { frames: [8, 9, 10, 11, 12, 13, 14, 15] }),
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

        this.anims.create({
            key: 'cacodaemonAnim',
            frames: this.anims.generateFrameNumbers('cacodaemon', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'cacodaemonDeath',
            frames: this.anims.generateFrameNumbers('cacodaemon', { start: 24, end: 31 }),
            frameRate: 8,
            repeat: 0 // Animation does not repeat
        });

        this.anims.create({
            key: 'SkeletonBaixo',
            frames: this.anims.generateFrameNumbers('skeleton', { frames: [12, 13, 14, 15] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'SkeletonCima',
            frames: this.anims.generateFrameNumbers('skeleton', { frames: [20, 21, 22, 23] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'SkeletonLado',
            frames: this.anims.generateFrameNumbers('skeleton', { frames: [16, 17, 18, 19] }),
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

        const enemySpeed = 70; 
        const skeletonSpeed = 100; // Reduced speed for skeletons

        this.enemies.forEach((enemy, index) => {
            if (enemy.texture.key === 'cacodaemon') {
                this.updateEnemy(enemy, enemySpeed, 'cacodaemonAnim', index);
            } else if (enemy.texture.key === 'skeleton') {
                this.updateSkeleton(enemy, skeletonSpeed, index);
            }
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

    createCacodaemon(x, y, index) {
        let enemy = this.physics.add.sprite(x, y, 'cacodaemon').setScale(1);
        enemy.setCollideWorldBounds(true);
        enemy.body.setSize(enemy.width * 0.70, enemy.height * 0.70); // Increase hitbox size to 70% of original size
        enemy.anims.play('cacodaemonAnim', true); // Ensure the animation starts

        // Create a health bar for the enemy
        const healthBarWidth = 50;
        const healthBarHeight = 5;

        let healthbarBackground = this.add.graphics();
        let healthbar = this.add.graphics();

        healthbarBackground.fillStyle(0x808080, 1);
        healthbarBackground.fillRect(0, 0, healthBarWidth, healthBarHeight);
        healthbar.fillStyle(0xff0000, 1);
        healthbar.fillRect(0, 0, healthBarWidth, healthBarHeight);
        healthbar.setDepth(1); // Ensure health bar is drawn above other elements
        healthbarBackground.setDepth(0.9); // Ensure background is just below the health bar

        healthbarBackground.setPosition(enemy.x - healthBarWidth / 2, enemy.y - 20);
        healthbar.setPosition(enemy.x - healthBarWidth / 2, enemy.y - 20);

        this.healthbars[index] = healthbar;
        this.healthbarBackgrounds[index] = healthbarBackground;

        this.enemyGroup.add(enemy); // Add enemy to the group
        this.enemies.push(enemy);
    }

    createSkeleton(x, y, index) {
        let enemy = this.physics.add.sprite(x, y, 'skeleton').setScale(3);
        enemy.setCollideWorldBounds(true);
        enemy.body.setSize(enemy.width * 0.50, enemy.height * 0.50); // Decreased hitbox size to 50% of original size

        // Create a health bar for the enemy
        const healthBarWidth = 50;
        const healthBarHeight = 5;

        let healthbarBackground = this.add.graphics();
        let healthbar = this.add.graphics();

        healthbarBackground.fillStyle(0x808080, 1);
        healthbarBackground.fillRect(0, 0, healthBarWidth, healthBarHeight);
        healthbar.fillStyle(0xff0000, 1);
        healthbar.fillRect(0, 0, healthBarWidth, healthBarHeight);
        healthbar.setDepth(1); // Ensure health bar is drawn above other elements
        healthbarBackground.setDepth(0.9); // Ensure background is just below the health bar

        healthbarBackground.setPosition(enemy.x - healthBarWidth / 2, enemy.y - 20);
        healthbar.setPosition(enemy.x - healthBarWidth / 2, enemy.y - 20);

        this.healthbars[index] = healthbar;
        this.healthbarBackgrounds[index] = healthbarBackground;

        this.enemyGroup.add(enemy); // Add enemy to the group
        this.enemies.push(enemy);
    }

    updateEnemy(enemy, speed, animKey, index) {
        this.physics.moveToObject(enemy, this.player, speed);
        enemy.anims.play(animKey, true);

        let enemyVelocity = new Phaser.Math.Vector2(
            this.player.x - enemy.x,
            this.player.y - enemy.y
        );

        let angle = Phaser.Math.RadToDeg(Math.atan2(enemyVelocity.y, enemyVelocity.x));
        enemy.setAngle(angle);

        if (enemyVelocity.x < 0) {
            enemy.setFlipY(true);
        } else {
            enemy.setFlipY(false);
        }

        // Update health bar position
        const healthBarWidth = 50;
        this.healthbarBackgrounds[index].setPosition(enemy.x - healthBarWidth / 2, enemy.y - 20);
        this.healthbars[index].setPosition(enemy.x - healthBarWidth / 2, enemy.y - 20);
    }

    updateSkeleton(skeleton, speed, index) {
        this.physics.moveToObject(skeleton, this.player, speed);
        
        let direction = new Phaser.Math.Vector2(
            this.player.x - skeleton.x,
            this.player.y - skeleton.y
        ).normalize();

        if (Math.abs(direction.x) > Math.abs(direction.y)) {
            skeleton.anims.play('SkeletonLado', true);
            skeleton.setFlipX(direction.x < 0);
        } else if (direction.y > 0) {
            skeleton.anims.play('SkeletonBaixo', true);
        } else {
            skeleton.anims.play('SkeletonCima', true);
        }

        // Update health bar position
        const healthBarWidth = 50;
        this.healthbarBackgrounds[index].setPosition(skeleton.x - healthBarWidth / 2, skeleton.y - 20);
        this.healthbars[index].setPosition(skeleton.x - healthBarWidth / 2, skeleton.y - 20);
    }

    updateEnemyHealthBar(enemy, index) {
        const healthBarWidth = 50;
        const healthBarHeight = 5;
        const healthPercent = this.enemyHits[index] / 4;
        this.healthbars[index].clear();
        this.healthbars[index].fillStyle(0xff0000, 1);
        this.healthbars[index].fillRect(0, 0, healthBarWidth * healthPercent, healthBarHeight);
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

        this.enemyHits[index] -= 1;
        
        this.updateEnemyHealthBar(enemy, index);
        console.log(`Vidas restantes do Inimigo ${index + 1}:`, this.enemyHits[index]);

        if (this.enemyHits[index] <= 0) {
            enemy.setVelocity(0); 
            if (enemy.texture.key === 'cacodaemon') {
                enemy.anims.play('cacodaemonDeath');
            }
            enemy.setActive(false).setVisible(false);
            this.healthbars[index].destroy();
            this.healthbarBackgrounds[index].destroy();
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

    checkAllEnemiesDestroyed() {
        if (this.enemyHits.every(hit => hit <= 0)) {
            this.portal2.setVisible(true);
            this.portal2.anims.play('portalFinal-open', true).on('animationcomplete', () => {
                this.portal2.anims.play('portalFinal-idle', true);
                this.physics.world.enable(this.portal2);
                this.portal2.body.setSize(40, 10);
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
            this.scene.start('ThirdUpScene', { playerHealth: this.playerHealth, hearts: this.heartTextures });
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
