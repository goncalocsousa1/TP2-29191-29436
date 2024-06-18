export default class MainScene extends Phaser.Scene {

    constructor() {
        super('MainScene');
        this.bullets;
        this.canShootIce = true;
        this.canShootFireball = true;
        this.enemyHits = 3;
        this.enemyHitsCaco = 3;
        this.isEnemyDestroyed = false;
        this.hitCooldown = false;
        this.currentDirection;
        this.playerHealth = 5; // saúde inicial do jogador
        this.dialogueSceneKey = 'DialogueScene'; // Key for the DialogueScene
        this.internetExplorerDialogue = [
            "C:\InternetExplorer> Hello, I'm Internet Explorer.",
            "I'm here to stop you from exploring further!",
            "Prepare to face my Internet Powers!"
        ];
        this.dialogueTriggered = false;
        let walls; // Reference to the wall layer
    }
    

  

    preload() {
        console.log("preload");
        
        //mapa
        this.load.image('tiles', 'assets/images/motherboard.png');
        this.load.tilemapTiledJSON('motherboard', 'assets/maps/motherboard.json');
      
        //player
        //this.load.atlas('Nerd', 'assets/images/Player/nerd.png', 'assets/images/Player/nerd_atlas.json');
    
        this.load.spritesheet('ice', 'assets/images/Attacks/Ice.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('fireball', 'assets/images/Attacks/fireball.png', { frameWidth: 64, frameHeight: 32 });
        this.load.spritesheet('nerd', 'assets/images/Player/nerd.png', { frameWidth: 96, frameHeight: 96 });
        this.load.image('full_health_heart', 'assets/images/HUD/full_health_heart.png');
        this.load.image('half_health_heart', 'assets/images/HUD/half_health_heart.png');
        this.load.image('empty_health_heart', 'assets/images/HUD/empty_health_heart.png');
        this.load.image('nerd_face', 'assets/images/HUD/nerdFace.png');
        this.load.image('internet_explorer', 'assets/images/Enemies/internetExplorer.png');
        this.load.spritesheet('cacodaemon', 'assets/images/Enemies/Cacodaemon.png', {
            frameWidth: 64, 
            frameHeight: 64  
        });
        this.load.spritesheet('portal', 'assets/images/Portal/portal.png', {frameWidth: 64, frameHeight: 64});
    }
    
    create() {
        this.cameras.main.setZoom(0.95);
        //this.add.image(500, 500, 'tiles')
        console.log("create");
        const map = this.make.tilemap({ key: 'motherboard' });
        const tileset = map.addTilesetImage('motherboard', 'tiles');
        //const background = map.createLayer('background', tileset, 0 , 0);
        
        this.walls = map.createLayer('wall', tileset, 0, 0).setScale(0.75);
        this.walls.setCollisionByExclusion([-1]);
        
        const backgroundLayer = map.createLayer('ground', tileset, 0, 0).setScale(0.75);
        //this.walls = this.physics.add.staticGroup();
        //this.walls.create(400, 300, 'wall');

      
        // Create the player with a circular hitbox
        const playerRadius = 23; // Ajuste o raio conforme necessário
    
        this.player = this.physics.add.sprite(475, 265, 'nerd').setScale(0.75);
       
        this.player.setCollideWorldBounds(true);  // Faz o sprite colidir com os limites do mundo

        this.player.body.setSize(48, 48);

        // Centrando a hitbox no sprite, necessário se o sprite for redimensionado ou se as dimensões do corpo não coincidirem com as do sprite
        this.player.body.setOffset((this.player.width - 48) / 2, (this.player.height - 48) / 2);

        this.player.setCollideWorldBounds(true);  // Faz o sprite colidir com os limites do mundo
        this.physics.add.collider(this.player, this.walls);
        //this.physics.add.overlap(this.player, this.walls);
    
        this.nerdFace = this.add.image(90, 45, 'nerd_face').setScale(0.3);
        this.hearts = [];
        for (let i = 0; i < 5; i++) {
            let xPosition = 70 + i * 30;
            let heart = this.add.image(xPosition, 25, 'full_health_heart').setScale(2);
            this.hearts.push(heart);
        }
    
    
        this.internetExplorer = this.physics.add.sprite(250, 250, 'internet_explorer').setScale(0.20);
        
        //this.internetExplorer.lives = 3; 
        console.log('Vidas do Inimigo na criação:', this.enemyHits);
    
        this.cacodaemon = this.physics.add.sprite(400, 300, 'cacodaemon').setScale(1);
       
    
        this.portal1 = this.add.sprite(50, 265, 'portal').setScale(1.5);
        this.anims.create({
            key: 'portal-idle',
            frames: this.anims.generateFrameNumbers('portal', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
            frameRate: 8,
            repeat: -1
        })
        this.portal1.anims.play('portal-idle', true);
    
        this.physics.world.enable(this.portal1);
        this.portal1.body.setSize(20, 50);
        
        this.physics.add.overlap(this.player, this.portal1, this.enterPortal, null, this);
    
        this.portal2 = this.add.sprite(870, 265, 'portal').setScale(1.5);
        this.portal2.anims.play('portal-idle', true);
        
        
        this.anims.create({
            key: 'andar-direita-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [6, 7, 8, 7] }), // Assuming the frames for walking right are 0 to 3
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'andar-esquerda-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [3, 4, 5, 4] }), // Assuming the frames for walking left are 4 to 7
            frameRate: 8,
            repeat: -1
        });
    
        this.anims.create({
            key: 'andar-frente-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [9, 10, 11, 10] }), // Assuming the frames for walking down are 8 to 11
            frameRate: 8,
            repeat: -1
        });
    
        this.anims.create({
            key: 'andar-tras-animation',
            frames: this.anims.generateFrameNumbers('nerd', { frames: [0, 1, 2, 1] }), // Assuming the frames for walking up are 12 to 15
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
        

        this.fireballs = this.physics.add.group({
            defaultKey: 'fireball',
            maxSize: 100
        });
        this.physics.add.overlap(this.fireballs, this.internetExplorer, this.hitEnemy1, null, this);
        this.physics.add.overlap(this.fireballs, this.cacodaemon, this.hitEnemy2, null, this);
        

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
    
        // Criação dos gráficos para as hitboxes
        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 } });
    
        // Criação do grupo de balas
        this.bullets = this.physics.add.group({
            defaultKey: 'ice',
            runChildUpdate: true 
        });
        this.fireballs = this.physics.add.group({
            defaultKey: 'fireball',
            maxSize:100
        });

        //this.physics.add.collider(this.bullets, this.internetExplorer, this.bulletHitEnemy, null, this);
    
        // Colisão entre balas e inimigos
        //this.physics.add.collider(this.bullets, this.internetExplorer, this.bulletHitEnemy, null, this);
    
        this.physics.add.overlap(this.player, this.cacodaemon, this.handlePlayerDamage, null, this);
        this.physics.add.overlap(this.player, this.internetExplorer, this.handlePlayerDamage, null, this);
        

        this.physics.world.createDebugGraphic();

        // Visualizar a hitbox dos fireballs
        this.fireballs.children.iterate((fireball) => {
            this.physics.world.enableBody(fireball, Phaser.Physics.Arcade.DYNAMIC_BODY);
            fireball.body.setCircle(15);  // Ajuste conforme necessário
        });

        //this.physics.add.overlap(this.player, this.internetExplorer, this.interactWithInternetExplorer, null, this);
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
            this.currentDirection = 'up';
        }
        if (this.inputKeys.down.isDown && (this.inputKeys.right.isDown || this.inputKeys.left.isDown)) {
            playerVelocity.y = 1;
            this.player.anims.play('andar-tras-animation', true);
            isMoving = true;
            this.currentDirection = 'down';
        }
    
        // Handle single key presses
        if (this.inputKeys.left.isDown || this.inputKeys.leftArrow.isDown) {
            playerVelocity.x = -1;
            if (!isMoving) {
                this.player.anims.play('andar-esquerda-animation', true);
                this.currentDirection = 'left';
            }
            isMoving = true;
        }
        if (this.inputKeys.right.isDown || this.inputKeys.rightArrow.isDown) {
            playerVelocity.x = 1;
            if (!isMoving) {
                this.player.anims.play('andar-direita-animation', true);
                this.currentDirection = 'right';
            }
            isMoving = true;
        }
        if (this.inputKeys.up.isDown || this.inputKeys.upArrow.isDown) {
            playerVelocity.y = -1;
            if (!isMoving) {
                this.player.anims.play('andar-frente-animation', true);
                this.currentDirection = 'up';
            }
            isMoving = true;
        }
        if (this.inputKeys.down.isDown || this.inputKeys.downArrow.isDown) {
            playerVelocity.y = 1;
            if (!isMoving) {
                this.player.anims.play('andar-tras-animation', true);
                this.currentDirection = 'down';
            }
            isMoving = true;
        }
    
        if (!isMoving) {
            this.player.anims.stop();
        }
    
        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.player.setVelocity(playerVelocity.x, playerVelocity.y);
    
        const enemySpeed = 0.15; // Constant speed of the enemy
        let enemyVelocity = new Phaser.Math.Vector2(
            this.player.x - this.internetExplorer.x,
            this.player.y - this.internetExplorer.y
        );

        
            enemyVelocity.normalize(); // Normalize the vector to have length 1
            enemyVelocity.scale(enemySpeed); // Adjust to the enemy's speed
            this.internetExplorer.x += enemyVelocity.x; // Apply the movement
            this.internetExplorer.y += enemyVelocity.y;
        
    
        this.graphics.clear();
        this.updateEnemy(this.cacodaemon, 0.50, 23, 32, 'cacodaemonAnim');  // Usando a animação correta

    
        
        if (isMoving) {
            playerVelocity.normalize();
            playerVelocity.scale(speed);
            this.player.setVelocity(playerVelocity.x, playerVelocity.y);
        } else {
            this.player.setVelocity(0, 0);
        }
    
        
        // Verifica se a tecla de espaço foi pressionada
        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.space)) {
            this.fireBullet();
        }
        
    }
    
    updateEnemy(enemy, speed, playerRadius, enemyRadius, animKey) {
        let enemyVelocity = new Phaser.Math.Vector2(
            this.player.x - enemy.x,
            this.player.y - enemy.y
        );
        const minDistance = playerRadius + enemyRadius;
    
        
            enemyVelocity.normalize();
            enemyVelocity.scale(speed);
            enemy.x += enemyVelocity.x;
            enemy.y += enemyVelocity.y;
            enemy.anims.play(animKey, true);
    
            // Calcula o ângulo correto de rotação em graus
            let angle = Phaser.Math.RadToDeg(Math.atan2(enemyVelocity.y, enemyVelocity.x));
    
            // Ajusta o ângulo do sprite para olhar na direção do movimento
            enemy.setAngle(angle);
    
            // Opcional: ajuste para inverter o sprite se estiver se movendo para esquerda e o sprite só olhar para a direita
            if (enemyVelocity.x < 0) {
                enemy.setFlipY(true);  // Inverte verticalmente se o sprite só estiver desenhado para olhar para a direita
            } else {
                enemy.setFlipY(false);
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
        this.physics.pause();  // Pausa toda a física
        this.anims.pauseAll(); // Pausa todas as animações
    
        this.createText();
    
        // Desativar todos os controles do jogador
        this.input.keyboard.removeAllKeys(true);
    
        this.cacodaemon.setVelocity(0, 0);
        this.internetExplorer.setVelocity(0, 0);
        this.cacodaemon.anims.stop();
        this.internetExplorer.anims.stop();
    }
    
    
    
    createText() {
        this.gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '404 Life Not Found', {
            fontFamily: 'Orbitron',
            fontSize: '32px',
            fill: '#ff0000'
        }).setOrigin(0.5);
    }
    

    shootFireball() {
        
        if (!this.canShootFireball) return;
        this.canShootFireball = false;
        
    
        const fireball = this.fireballs.get(this.player.x, this.player.y, 'fireball').setScale(1);
        fireball.anims.play('Fireball');
    
        this.physics.add.overlap(fireball, this.internetExplorer, this.hitEnemy1, null, this);
        this.physics.add.overlap(fireball, this.cacodaemon, this.hitEnemy2, null, this);
        let velocityX = 0;
        let velocityY = 0;
        switch (this.currentDirection) {
            case 'left':
                velocityX = -300;
                fireball.angle = 180;
                break;
            case 'right':
                velocityX = 300;
                fireball.angle = 0;
                break;
            case 'up':
                velocityY = -300;
                fireball.angle = -90; 
                break;
            case 'down':
                velocityY = 300;
                fireball.angle = 90;
                break;
        }
        fireball.setVelocity(velocityX, velocityY);
            this.time.addEvent({
                delay: this.fireballCooldownTime,
                callback: () => {
                    this.canShootFireball = true;
                },
                callbackScope: this
            });
        }
        hitEnemy1(attack, enemy){
            this.time.delayedCall(50, () => {  
                attack.destroy();
            })
            
            this.enemyHits -=1;
            console.log("vidas =" + this.enemyHits);
            if(this.enemyHits <=0){
                this.internetExplorer.destroy();
                console.log("MORREU");
            }
        }
       /* hitEnemy2(attack, enemy){
            this.time.delayedCall(50, () => {  
                attack.destroy();
            })
            
            this.enemyHitsCaco -=1;
            console.log("vidas cacao =" + this.enemyHitsCaco);
            if(this.enemyHitsCaco <=0){
                this.cacodaemon.destroy();
                console.log("MORREU cacao");
            }
        }*/
    fireBullet() {
        if (!this.canShootIce) return;
        this.canShootIce = false;
        
        let bulletX = this.player.x;
        let bulletY = this.player.y;
        const offset = 20;  // Ajuste de posição
        let velocityX = 0;
        let velocityY = 0;
    
        const icebullet = this.bullets.get(bulletX, bulletY, 'ice');
        icebullet.setScale(1).setActive(true).setVisible(true);
        
        const hitboxSize = 30;  // Define o tamanho da hitbox, ajuste conforme necessário
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
        this.physics.add.overlap(icebullet, this.internetExplorer, this.bulletHitEnemy, null, this);
        this.physics.add.overlap(icebullet, this.cacodaemon, this.bulletHitEnemyCaco, null, this);
    }
    
  
    
    bulletHitEnemy(icebullet, internetExplorer) {
        if (this.hitCooldown) return; // Ignora o hit se estiver em cooldown
    
        this.hitCooldown = true; // Ativa o cooldown para evitar hits múltiplos rapidamente
    
        this.enemyHits -= 1; // Diminui uma vida do inimigo a cada acerto
        console.log('Vidas restantes do Inimigo:', this.enemyHits); // Log para depuração
    
        if (this.enemyHits <= 0) {
            internetExplorer.destroy(); // Destrói o inimigo se ele não tiver mais vidas
            this.isEnemyDestroyed = true; // Sinaliza que o inimigo foi destruído
            console.log('Inimigo destruído');
        } else {
            icebullet.anims.play('EnemyHit'); // Toca a animação de hit
        }
    
        // Configura um evento temporizado para remover o cooldown
        this.time.addEvent({
            delay: 1000, // 1 segundo de cooldown
            callback: () => {
                this.hitCooldown = false; // Desativa o cooldown
            },
            callbackScope: this
        });
    
        // Adiciona um delay antes de destruir a bala
        this.time.delayedCall(500, () => {
            icebullet.destroy();  // Destrói a bala após um delay de 500 ms
        });
    }
    
    enterPortal(player, portal) {
        this.scene.start('FirstLeftScene');
    }
    
    interactWithInternetExplorer(player, internetExplorer) {
        if (!this.dialogueTriggered) { // Check if dialogue has already been triggered
            this.dialogueTriggered = true; // Set flag to true
            this.scene.launch(this.dialogueSceneKey, { dialogueData: this.internetExplorerDialogue });
            this.scene.pause();

            // Resume the game when dialogue scene is stopped
            this.events.on('resume', () => {
                this.scene.resume();
            });
        }
    }
    
}
