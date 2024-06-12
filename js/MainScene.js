export default class MainScene extends Phaser.Scene {
    constructor(){
        super('MainScene');
    }

    preload() {
        console.log("preload");
        //mapa
        this.load.image('tiles', 'assets/images/tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/maps/map1.json');

        //player
        this.load.atlas('Nerd', 'assets/images/Player/nerd.png', 'assets/images/Player/nerd_atlas.json');

        this.load.spritesheet('nerd', 'assets/images/Player/nerd.png', {frameWidth: 96, frameHeight: 96});
        this.load.image('full_health_heart', 'assets/images/HUD/full_health_heart.png');
        this.load.image('half_health_heart', 'assets/images/HUD/half_health_heart.png');
        this.load.image('empty_health_heart', 'assets/images/HUD/empty_health_heart.png');
        this.load.image('nerd_face', 'assets/images/HUD/nerdFace.png');
        this.load.image('internet_explorer', 'assets/images/Enemies/internetExplorer.png');
    }

    create() {
        console.log("create");
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Minifantasy_ForgottenPlainsTiles', 'tiles');
        const layer1 = map.createLayer('Camada de Blocos 1', tileset);
    
        // Create the player with a circular hitbox
        const playerRadius = 36; // Adjust the radius as needed
        const { Bodies } = Phaser.Physics.Matter.Matter;
        const playerBody = Bodies.circle(0, 0, playerRadius, { isSensor: false });
        this.player = this.matter.add.sprite(250, 200, 'nerd').setScale(0.75);
        this.player.setExistingBody(playerBody);
        this.player.setFixedRotation();
        
        const enemyRadius = 36; // Adjust the radius as needed
        const enemyBody = Bodies.circle(0, 0, enemyRadius, { isSensor: false });
        this.internetExplorer = this.matter.add.sprite(250, 250, 'internet_explorer').setScale(0.05);
        this.internetExplorer.setExistingBody(enemyBody);
        this.internetExplorer.setFixedRotation();


        this.nerdFace = this.add.image(90, 45, 'nerd_face').setScale(0.3);
        this.fullHealthHeart = this.add.image(70, 25, 'full_health_heart').setScale(2);
        this.halfHealthHeart = this.add.image(100, 25, 'full_health_heart').setScale(2);
        this.halfHealthHeart = this.add.image(130, 25, 'full_health_heart').setScale(2);
        this.halfHealthHeart = this.add.image(160, 25, 'half_health_heart').setScale(2);
        this.halfHealthHeart = this.add.image(190, 25, 'empty_health_heart').setScale(2);
    
        this.internetExplorer = this.add.image(250, 250, 'internet_explorer').setScale(0.05);
    
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

        this.matter.world.on('collisionstart', (event) => {
    event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if ((bodyA === this.player.body && bodyB === this.internetExplorer.body) ||
            (bodyB === this.player.body && bodyA === this.internetExplorer.body)) {
            //implementar dano e imunidade
            console.log('Player collided with enemy');
        }
    });
});

        
    }
    

    update() {
        const speed = 2.5;
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
    
        // Handle single key pressesx
        if (this.inputKeys.left.isDown || this.inputKeys.leftArrow.isDown) {
            playerVelocity.x = -1;
            if (!isMoving) {
                this.player.anims.play('andar-esquerda-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.right.isDown || this.inputKeys.rightArrow.isDown) {
            playerVelocity.x = 1;
            if (!isMoving) {
                this.player.anims.play('andar-direita-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.up.isDown || this.inputKeys.upArrow.isDown) {
            playerVelocity.y = -1;
            if (!isMoving) {
                this.player.anims.play('andar-frente-animation', true);
            }
            isMoving = true;
        }
        if (this.inputKeys.down.isDown || this.inputKeys.downArrow.isDown) {
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
    
        const enemySpeed = 0.1; // Constant speed of the enemy
        let enemyVelocity = new Phaser.Math.Vector2(
            this.player.x - this.internetExplorer.x,
            this.player.y - this.internetExplorer.y
        );
    
        const playerRadius = 36; // Radius of the player's hitbox   
        const enemyRadius = 36; // Radius of the enemy's hitbox
        const minDistance = playerRadius + enemyRadius; // Minimum distance before stopping the enemy
    
        if (enemyVelocity.length() > minDistance) { // Ensure there is a distance to be covered
            enemyVelocity.normalize(); // Normalize the vector to have length 1
            enemyVelocity.scale(enemySpeed); // Adjust to the enemy's speed
            this.internetExplorer.x += enemyVelocity.x; // Apply the movement
            this.internetExplorer.y += enemyVelocity.y;
        }
        
    }
    
}