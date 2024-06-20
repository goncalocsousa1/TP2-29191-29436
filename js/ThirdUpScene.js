export default class ThirdUpScene extends Phaser.Scene {
    constructor() {
        super('ThirdUpScene');
        this.bullets;
        this.canShootIce = true;
        this.isEnemyDestroyed = false;
        this.hitCooldown = false;
        this.currentDirection;
        this.boss;
        this.bossHealth = 20; // Boss life 
        this.specialAttackCooldown = false;
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
        this.load.image('Trojan', 'assets/images/Enemies/Trojan.png');
        this.load.spritesheet('portal', 'assets/images/Portal/portal.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.cameras.main.setZoom(0.95);
        this.physics.world.createDebugGraphic();

        const map = this.make.tilemap({ key: 'motherboard' });
        const tileset = map.addTilesetImage('motherboard', 'tiles');
        
        this.walls = map.createLayer('wall', tileset, 0, 0).setScale(0.75);
        this.walls.setCollisionByExclusion([-1]);

        const backgroundLayer = map.createLayer('ground', tileset, 0, 0).setScale(0.75);

        if (!this.walls || !backgroundLayer) {
            console.error("Layer not found in the tilemap. Check the layer names.");
            return;
        }
        
        for (let i = 0; i < 5; i++) {
            let xPosition = 70 + i * 30;
            let heart = this.add.image(xPosition, 25, this.heartTextures[i]).setScale(2);
            this.hearts.push(heart);
        }

        this.player = this.physics.add.sprite(475, 265, 'nerd').setScale(0.75);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(48, 48);
        this.player.body.setOffset((this.player.width - 48) / 2, (this.player.height - 48) / 2);
        this.physics.add.collider(this.player, this.walls);

        this.nerdFace = this.add.image(90, 45, 'nerd_face').setScale(0.3);

        this.boss = this.createBoss(450, 50);

        this.portal1 = this.add.sprite(870, 265, 'portal').setScale(1.5);
        this.anims.create({
            key: 'portal-idle',
            frames: this.anims.generateFrameNumbers('portal', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        });
        this.portal1.anims.play('portal-idle', true);

        this.portal2 = this.add.sprite(450, 30, 'portal').setScale(2);
        this.portal2.anims.play('portal-idle', true);
        this.portal2.setAngle(90);
        this.portal2.setVisible(false);

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

        this.physics.add.overlap(this.player, this.boss, () => this.handlePlayerDamage(this.player, this.boss, 1), null, this);

        // Schedule special attacks for the boss with reduced delay
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000), // Random delay between 2 to 5 seconds
            callback: () => {
                if (this.boss.active) {
                    this.specialAttack(this.boss);
                }
            },
            callbackScope: this,
            loop: true
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

        const bossSpeed = 0.2;
        this.updateBoss(this.boss, bossSpeed);

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

    createBoss(x, y) {
        let boss = this.physics.add.sprite(x, y, 'Trojan').setScale(0.20);
        boss.setCollideWorldBounds(true);
        return boss;
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

        this.physics.add.overlap(this.bullets, this.boss, this.bulletHitBoss, null, this);
    }

    bulletHitBoss(boss, icebullet) {
        if (this.hitCooldown) return;

        this.hitCooldown = true;

        this.bossHealth -= 1;
        console.log('Vidas restantes do Boss:', this.bossHealth);

        if (this.bossHealth <= 0) {
            boss.setActive(false).setVisible(false);
            boss.body.enable = false;
            this.isEnemyDestroyed = true;
            console.log('Boss destruído');
            this.portal2.setVisible(true);
            this.physics.world.enable(this.portal2);
            this.portal2.body.setSize(35, 10);
            this.physics.add.overlap(this.player, this.portal2, this.enterPortal, null, this);
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

    updateBoss(boss, speed) {
        let bossVelocity = new Phaser.Math.Vector2(
            this.player.x - boss.x,
            this.player.y - boss.y
        );

        bossVelocity.normalize();
        bossVelocity.scale(speed);
        boss.x += bossVelocity.x;
        boss.y += bossVelocity.y;

        let angle = Phaser.Math.RadToDeg(Math.atan2(bossVelocity.y, bossVelocity.x));
        boss.setAngle(angle);

        if (bossVelocity.x < 0) {
            boss.setFlipY(true);
        } else {
            boss.setFlipY(false);
        }
    }

    specialAttack(boss) {
        this.specialAttackCooldown = true;
        let directions = [
            { x: 400, y: 0, angle: 0 },
            { x: -400, y: 0, angle: 180 },
            { x: 0, y: 400, angle: 90 },
            { x: 0, y: -400, angle: -90 }
        ];

        directions.forEach(dir => {
            let projectile = this.bullets.get(boss.x, boss.y, 'ice').setScale(1);
            projectile.setVelocity(dir.x, dir.y);
            projectile.angle = dir.angle;
            projectile.anims.play('Ataque');
            const hitboxSize = 30;
            projectile.body.setSize(hitboxSize, hitboxSize);
            projectile.body.setOffset((projectile.width - hitboxSize) / 2, (projectile.height - hitboxSize) / 2);

            // Check for collision with the player
            this.physics.add.overlap(projectile, this.player, (player, projectile) => {
                this.handlePlayerDamage(player, projectile, 0.5);
                
            }, null, this);
        });

        this.time.addEvent({
            delay: 2000, // Reduced cooldown time for next special attack
            callback: () => {
                this.specialAttackCooldown = false;
            },
            callbackScope: this
        });
    }

    enterPortal(player, portal) {
        this.scene.start('ThirdUpScene', { playerHealth: this.playerHealth, hearts: this.heartTextures });
    }

    handlePlayerDamage(player, enemy, damage) {
        this.applyDamageToPlayer(damage);
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
}
