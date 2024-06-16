import FirstLeftScene from "./FirstLeftScene.js";
import MainScene from "./MainScene.js";

const config = {
    width: 950,     //950
    height: 530,    //530
    backgroundColor: '#333333',
    type: Phaser.AUTO,
    parent: 'Hacker-Madness',
    scene: [MainScene, FirstLeftScene],
    scale: {
        zoom:2,
    },
    physics: {
        default: 'arcade',
        matter: {
            debug: true,
            gravity: {y:0},
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    }
}

new Phaser.Game(config);