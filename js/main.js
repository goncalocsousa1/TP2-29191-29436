const config = {
    width: 512,
    height: 432,
    backgroundColor: '#333333',
    type: Phaser.AUTO,
    parent: 'Hacker-Madness',
    scene:[],
    scale:{
        zoom:2,
    },
    physics:{
        default: 'matter',
        matter:{
            debug: true,
            gravity: {y:0},
        }
    },
    plugins:{
        scene:[
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    }
}

new Phaser.Game(config);